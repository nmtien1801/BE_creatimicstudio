import crypto from "crypto";
import axios from "axios"; // ✅ FIX: Thêm import axios (bị thiếu trong bản gốc)
import db from "../models/index.js";
import { getIo } from "../socket.js";

/**
 * 🔐 SEPAY WEBHOOK SERVICE
 * ============================================================
 * FIX:
 * - Thêm import axios
 * - Sửa regex parse orderId cho đúng format "SEPAY <orderId>"
 * - Làm rõ flow xử lý status
 * ============================================================
 */

/**
 * Verify Sepay Webhook Signature
 */
export const verifySepaySignature = (body, signature) => {
  try {
    if (!signature) {
      console.warn("⚠️ Missing X-Signature header");
      return false;
    }

    const secret = process.env.SEPAY_API_SECRET || "";
    if (!secret) {
      console.error("❌ SEPAY_API_SECRET is not set");
      return false;
    }

    const bodyString = typeof body === "string" ? body : JSON.stringify(body);

    const computed = crypto
      .createHmac("sha256", secret)
      .update(bodyString, "utf-8")
      .digest("hex");

    console.log("🔐 Signature verification:", {
      received: signature.substring(0, 16) + "...",
      computed: computed.substring(0, 16) + "...",
      match: signature === computed,
    });

    return signature === computed;
  } catch (err) {
    console.error("❌ Signature verification error:", err.message);
    return false;
  }
};

/**
 * Check Idempotency — Đảm bảo webhook chỉ xử lý 1 lần
 */
export const checkWebhookIdempotency = async (webhookId) => {
  if (!webhookId) return false;

  try {
    const existingRecord = await db.sequelize.query(
      `SELECT webhook_id FROM payment_webhooks WHERE webhook_id = ? LIMIT 1`,
      {
        replacements: [webhookId],
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    if (existingRecord && existingRecord.length > 0) {
      console.log("⚠️ Webhook already processed:", webhookId);
      return false;
    }

    await db.sequelize.query(
      `INSERT INTO payment_webhooks (webhook_id, created_at) VALUES (?, NOW())`,
      { replacements: [webhookId] },
    );

    return true;
  } catch (err) {
    console.error("❌ Idempotency check error:", err.message);
    return true; // fail-open
  }
};

/**
 * Log Webhook — Audit trail
 */
export const logWebhookRequest = async (data, status, error = null) => {
  try {
    await db.sequelize.query(
      `INSERT INTO webhook_logs (
        webhook_type, transaction_id, data, status, error, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          "sepay",
          data?.transactionId || data?.id || null,
          JSON.stringify(data),
          status,
          error ? String(error).substring(0, 500) : null,
        ],
      },
    );
  } catch (err) {
    console.error("❌ Webhook log error:", err.message);
  }
};

/**
 * Handle Sepay Payment Notification
 * ========================================================
 * Sepay webhook format:
 * {
 *   "id": "webhook_12345",
 *   "transactionId": "TXN_123456",
 *   "status": "completed",
 *   "amount": 100000,
 *   "accountNumber": "113366668888",
 *   "transferType": "RECEIVED",
 *   "transferName": "Payer Name",
 *   "description": "SEPAY SEPAY_1748123456789_AB3CD5678",
 *   "timestamp": "2026-05-25T10:30:00Z"
 * }
 */
export const handleSepayPaymentNotification = async (webhookData) => {
  const {
    id: webhookId,
    transactionId,
    status,
    amount,
    description,
  } = webhookData;

  try {
    // ✅ 1. Idempotency check
    const shouldProcess = await checkWebhookIdempotency(webhookId);
    if (!shouldProcess) {
      console.log("⏭️ Skipping duplicate webhook:", webhookId);
      return {
        success: true,
        message: "Duplicate webhook - already processed",
        processed: false,
      };
    }

    // ✅ 2. FIX: Parse orderId từ description với format cố định "SEPAY <orderId>"
    // Controller tạo description: `SEPAY ${orderId}` => "SEPAY SEPAY_1748..._ABCDE"
    const orderIdMatch = description?.match(/^SEPAY\s+(SEPAY_[A-Z0-9_]+)$/);
    const orderId = orderIdMatch?.[1] || null;

    if (!orderId) {
      const error = `Cannot parse orderId from description: "${description}"`;
      await logWebhookRequest(webhookData, "failed", error);
      throw new Error(error);
    }

    console.log("🔍 Processing Sepay notification:", {
      webhookId,
      transactionId,
      orderId,
      status,
      amount,
    });

    // ✅ 3. Kiểm tra order tồn tại
    const order = await db.Order.findByPk(orderId);
    if (!order) {
      const error = `Order not found: ${orderId}`;
      await logWebhookRequest(webhookData, "failed", error);
      return { success: false, message: error, statusCode: 404 };
    }

    // ✅ 4. Idempotent: Nếu đã paid, bỏ qua (tránh double-process)
    if (order.status === "paid") {
      console.log("⏭️ Order already paid:", orderId);
      await logWebhookRequest(webhookData, "skipped_already_paid", null);
      return { success: true, message: "Order already paid", processed: false };
    }

    // ✅ 5. Validate số tiền
    if (Number(amount) !== Number(order.amount)) {
      const error = `Amount mismatch: received ${amount}, expected ${order.amount}`;
      await logWebhookRequest(webhookData, "failed", error);
      return { success: false, message: error, statusCode: 400 };
    }

    // ✅ 6. Map status Sepay → status nội bộ
    let newOrderStatus = "pending";
    let newPaymentStatus = "pending";

    if (status === "completed") {
      newOrderStatus = "paid";
      newPaymentStatus = "success";
    } else if (status === "failed" || status === "cancelled") {
      newOrderStatus = "cancelled";
      newPaymentStatus = "failed";
    }
    // "pending" giữ nguyên

    order.status = newOrderStatus;
    order.paidAt = newOrderStatus === "paid" ? new Date() : null;
    await order.save();

    // ✅ 7. Cập nhật payment record
    const payment = await db.Payment.findOne({
      where: { orderId },
      order: [["createdAt", "DESC"]],
    });

    if (payment) {
      payment.status = newPaymentStatus;
      payment.transactionId = transactionId;
      payment.responseCode = webhookId;
      payment.responseMessage = description;
      payment.paidAt = newPaymentStatus === "success" ? new Date() : null;
      await payment.save();
    }

    // ✅ 8. Audit log
    await logWebhookRequest(webhookData, "success", null);

    // ✅ 9. Emit realtime update qua Socket.io
    try {
      const io = getIo();
      if (io) {
        io.emit(`order_${orderId}`, {
          orderId,
          status: newOrderStatus,
          transactionId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.log("⚠️ Socket.io emit warning:", err.message);
    }

    console.log("✅ Sepay webhook processed:", { orderId, newOrderStatus });
    return {
      success: true,
      message: "Payment processed",
      orderId,
      status: newOrderStatus,
      transactionId,
    };
  } catch (error) {
    console.error("❌ Error processing Sepay webhook:", error.message);
    await logWebhookRequest(webhookData, "error", error.message);
    throw error;
  }
};

/**
 * Query Transaction Status từ Sepay API
 * Dùng khi cần check chủ động (không chờ webhook)
 */
export const querySepayTransactionStatus = async (transactionId) => {
  try {
    const response = await axios.get(
      `${process.env.SEPAY_API_BASE_URL}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SEPAY_API_KEY}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Failed to query transaction status:", error.message);
    throw error;
  }
};

export default {
  verifySepaySignature,
  checkWebhookIdempotency,
  logWebhookRequest,
  handleSepayPaymentNotification,
  querySepayTransactionStatus,
};
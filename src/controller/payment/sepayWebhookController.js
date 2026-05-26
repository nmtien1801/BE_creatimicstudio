import { v4 as uuidv4 } from "uuid";
import db from "../../models/index.js";
import sepayWebhookService from "../../service/sepayWebhookService.js";

/**
 * 🔐 SEPAY WEBHOOK CONTROLLER
 * ============================================================
 * FIX:
 * - bankBin, accountNo, accountName KHÔNG nhận từ frontend.
 *   Lấy từ env/config để tránh giả mạo tài khoản ngân hàng.
 * - Validate amount tối thiểu/tối đa.
 * - orderId embed vào description để webhook dễ parse.
 * ============================================================
 */

/**
 * 📋 Tạo Order & VietQR QR Code
 * Endpoint: POST /api/payment/sepay/create-order
 *
 * ✅ FIX SECURITY: bankBin, accountNo lấy từ server config, KHÔNG từ req.body
 */
const createOrder = async (req, res) => {
  try {
    const { totalAmount, description, items } = req.body;

    // ✅ Validation amount
    const amount = Number(totalAmount);
    if (!amount || amount <= 0 || amount > 500_000_000) {
      return res.status(400).json({
        success: false,
        message: "Số tiền không hợp lệ (phải từ 1đ đến 500 triệu)",
      });
    }

    // ✅ FIX: Lấy bank info từ server config, KHÔNG từ client
    const bankBin = process.env.BANK_BIN;
    const accountNo = process.env.BANK_ACCOUNT_NO;
    const accountName = process.env.BANK_ACCOUNT_NAME || "CREATIMIC STUDIO";

    if (!bankBin || !accountNo) {
      console.error("❌ Missing BANK_BIN or BANK_ACCOUNT_NO in environment");
      return res.status(500).json({
        success: false,
        message: "Cấu hình thanh toán chưa hoàn chỉnh",
      });
    }

    // ✅ Generate unique order ID
    const orderId =
      `SEPAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    const transactionId = uuidv4();

    // ✅ FIX: Nhúng orderId vào description để webhook có thể parse chính xác
    // Format cố định: "SEPAY <orderId>" — phải khớp với regex trong service
    const safeDescription = `SEPAY ${orderId}`;

    console.log("📝 Creating Sepay order:", {
      orderId,
      amount,
      accountNo: accountNo.slice(-4).padStart(accountNo.length, "*"),
    });

    // ✅ Create Order in DB
    const order = await db.Order.create({
      orderId,
      amount,
      status: "pending",
      paymentMethod: "sepay",
      notes: String(description || "").slice(0, 255),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });

    // ✅ Create Payment record
    await db.Payment.create({
      orderId,
      transactionId,
      paymentMethod: "sepay",
      status: "pending",
      responseMessage: safeDescription,
      amount,
    });

    // ✅ Generate VietQR quicklink
    const vietqrQuickLink = `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(safeDescription)}`;

    const webhookUrl = `${process.env.BE_URL}/api/payment/sepay/webhook`;

    res.status(201).json({
      success: true,
      order: {
        orderId,
        transactionId,
        totalAmount: amount,
        status: "pending",
        expiresAt: order.expiresAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
      },
      payment: {
        vietqr: {
          qrImageUrl: vietqrQuickLink,
          description: safeDescription,
          // ✅ Mask account number trước khi trả về client
          accountNumber: accountNo.slice(-4).padStart(accountNo.length, "*"),
          accountName,
          amount: amount.toLocaleString("vi-VN"),
        },
        sepay: {
          webhookUrl,
          transactionId,
          instruction: "Khách hàng quét mã QR bằng app ngân hàng và chuyển khoản",
          timeout: "15 phút",
        },
      },
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo đơn hàng",
    });
  }
};

/**
 * 🪝 SEPAY WEBHOOK ENDPOINT
 * Endpoint: POST /api/payment/sepay/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-signature"];
    const body = req.rawBody || JSON.stringify(req.body);

    if (!sepayWebhookService.verifySepaySignature(body, signature)) {
      console.error("🚫 Webhook signature verification failed");
      // Trả 200 để Sepay không retry với signature sai
      return res.status(200).json({
        success: false,
        message: "Invalid signature",
        processed: false,
      });
    }

    console.log("✅ Webhook signature verified");

    // ✅ Trả 200 ngay lập tức để Sepay không timeout
    res.status(200).json({
      success: true,
      message: "Webhook received",
      processed: true,
    });

    // ✅ Xử lý async sau khi đã respond
    setImmediate(async () => {
      try {
        const result = await sepayWebhookService.handleSepayPaymentNotification(req.body);
        console.log("✅ Webhook processed:", result);
      } catch (err) {
        console.error("❌ Async webhook processing error:", err.message);
      }
    });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(200).json({
      success: false,
      message: "Error processing webhook",
      processed: false,
    });
  }
};

/**
 * 📊 Get Order Status
 * Endpoint: GET /api/payment/sepay/order/:orderId
 */
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // ✅ Validate format orderId để tránh injection
    if (!orderId || !/^SEPAY_[A-Z0-9_]+$/.test(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Order ID không hợp lệ",
      });
    }

    const order = await db.Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order không tồn tại",
      });
    }

    const payment = await db.Payment.findOne({
      where: { orderId },
      order: [["createdAt", "DESC"]],
    });

    // ✅ Auto-expire nếu quá hạn
    if (
      order.status === "pending" &&
      order.expiresAt &&
      new Date(order.expiresAt) < new Date()
    ) {
      order.status = "cancelled";
      await order.save();
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        expiresAt: order.expiresAt,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
      payment: payment
        ? {
            transactionId: payment.transactionId,
            status: payment.status,
            paidAt: payment.paidAt,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Get order status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy trạng thái đơn hàng",
    });
  }
};

/**
 * ✅ Manual Payment Confirmation (chỉ dùng khi testing)
 * Endpoint: POST /api/payment/sepay/confirm/:orderId
 */
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu transaction ID",
      });
    }

    const order = await db.Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order không tồn tại",
      });
    }

    // ✅ Không cho confirm nếu đã cancelled/expired
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã bị huỷ, không thể xác nhận",
      });
    }

    if (order.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được thanh toán trước đó",
      });
    }

    order.status = "paid";
    order.paidAt = new Date();
    await order.save();

    const payment = await db.Payment.findOne({
      where: { orderId },
      order: [["createdAt", "DESC"]],
    });

    if (payment) {
      payment.status = "success";
      payment.transactionId = transactionId;
      payment.paidAt = new Date();
      await payment.save();
    }

    res.json({
      success: true,
      message: "Thanh toán đã được xác nhận",
      order: { orderId, status: "paid" },
    });
  } catch (error) {
    console.error("❌ Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xác nhận thanh toán",
    });
  }
};

export default {
  createOrder,
  handleWebhook,
  getOrderStatus,
  confirmPayment,
};
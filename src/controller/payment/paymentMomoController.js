import crypto from "crypto";
import axios from "axios";
import db from "../../models/index";
import { log } from "console";

// MoMo Sandbox Configuration
const MOMO_CONFIG = {
  SANDBOX_URL: "https://test-payment.momo.vn/v2/gateway/api/create",
  PARTNER_CODE: process.env.PARTNER_CODE,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  REDIRECT_URL: `${process.env.REACT_URL || "http://localhost:5173"}/payment`,
  NOTIFY_URL: `${process.env.BE_URL || "http://localhost:8080"}/api/payment/webhook`,
};

// Tạo signature cho MoMo request
// MoMo yêu cầu format: accessKey=...&amount=...&... (không sort, đúng thứ tự field)
const generateMomoSignature = ({
  accessKey,
  amount,
  extraData,
  ipnUrl,
  orderId,
  orderInfo,
  partnerCode,
  redirectUrl,
  requestId,
  requestType,
}) => {
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  return crypto
    .createHmac("sha256", MOMO_CONFIG.SECRET_KEY)
    .update(rawSignature)
    .digest("hex");
};

// Tạo QR Code MoMo
export const createMomoQr = async (req, res) => {
  try {
    const {
      userId,
      productId,
      productName,
      quantity,
      amount,
      description,
      paymentMethod,
    } = req.body;

    if (!userId || !productId || !amount || amount <= 0) {
      return res.status(400).json({
        EC: 1,
        EM: "Dữ liệu không hợp lệ",
        DT: null,
      });
    }

    // Tạo order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const requestId = `${MOMO_CONFIG.PARTNER_CODE}-${Date.now()}`;
    const extraData = Buffer.from(
      JSON.stringify({ userId, productId, quantity }),
    ).toString("base64");

    const momoRequest = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      requestId,
      amount: String(Math.floor(amount)),
      orderId,
      orderInfo: description || `Thanh toán cho ${productName}`,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      ipnUrl: MOMO_CONFIG.NOTIFY_URL,
      extraData,
      requestType: "captureWallet",
      lang: "vi",
    };

    // Tạo signature theo đúng format MoMo
    momoRequest.signature = generateMomoSignature(momoRequest);

    // ✅ Gọi MoMo TRƯỚC khi lưu DB
    const momoResponse = await axios.post(
      MOMO_CONFIG.SANDBOX_URL,
      momoRequest,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      },
    );

    const momoData = momoResponse.data;
    console.log("MoMo response:", JSON.stringify(momoData, null, 2));

    // MoMo từ chối → return luôn, KHÔNG lưu DB
    if (momoData.resultCode !== 0) {
      return res.status(400).json({
        EC: 1,
        EM: momoData.message || "MoMo từ chối giao dịch",
        DT: null,
      });
    }

    // ✅ Chỉ lưu DB khi MoMo chấp nhận
    await db.Order.create({
      orderId,
      userId,
      productId,
      quantity,
      amount,
      status: "pending",
      paymentMethod,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    await db.Payment.create({
      orderId,
      paymentMethod,
      status: "pending",
      amount,
    });

    return res.status(200).json({
      EC: 0,
      EM: "Tạo QR Code thành công",
      DT: {
        orderId,
        qrCode: momoData.qrCodeUrl,
        deeplink: momoData.deeplink,
        payUrl: momoData.payUrl,
        amount,
        description: momoRequest.orderInfo,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error(
      "Error creating MoMo QR:",
      error?.response?.data || error.message,
    );
    res.status(500).json({
      EC: 1,
      EM: error?.response?.data?.message || "Lỗi khi tạo QR Code",
      DT: null,
    });
  }
};

// Kiểm tra trạng thái thanh toán
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        EC: 1,
        EM: "Order ID không hợp lệ",
        DT: null,
      });
    }

    const order = await db.Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy đơn hàng",
        DT: null,
      });
    }

    // Kiểm tra nếu đơn hàng đã hết hạn
    if (order.expiresAt < new Date() && order.status === "pending") {
      order.status = "cancelled";
      await order.save();
      return res.status(200).json({
        EC: 0,
        EM: "Lấy trạng thái thành công",
        DT: { orderId, status: "cancelled" },
      });
    }

    // Trả về status hiện tại từ DB
    // Status sẽ được cập nhật qua webhook từ MoMo (momoCallback)
    return res.status(200).json({
      EC: 0,
      EM: "Lấy trạng thái thành công",
      DT: {
        orderId,
        status: order.status, // pending | completed | failed | cancelled
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      EC: 1,
      EM: "Lỗi khi kiểm tra trạng thái thanh toán",
      DT: null,
    });
  }
};

// Lấy thông tin đơn hàng
export const getOrderInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        EC: 1,
        EM: "Order ID không hợp lệ",
        DT: null,
      });
    }

    const order = await db.Order.findByPk(orderId, {
      include: [
        { model: db.Product, as: "product" },
        { model: db.User, as: "user" },
      ],
    });

    if (!order) {
      return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy đơn hàng",
        DT: null,
      });
    }

    return res.status(200).json({
      EC: 0,
      EM: "Lấy thông tin đơn hàng thành công",
      DT: {
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        quantity: order.quantity,
        product: order.product,
        user: order.user,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error getting order info:", error);
    res.status(500).json({
      EC: 1,
      EM: "Lỗi khi lấy thông tin đơn hàng",
      DT: null,
    });
  }
};

// MoMo Webhook callback — MoMo gọi endpoint này sau khi user thanh toán
export const momoCallback = async (req, res) => {
  try {
    const { orderId, resultCode, signature: momoSignature, ...rest } = req.body;

    // Verify signature từ MoMo
    const localSignature = generateMomoSignature({
      accessKey: MOMO_CONFIG.ACCESS_KEY,
      amount: rest.amount,
      extraData: rest.extraData,
      ipnUrl: MOMO_CONFIG.NOTIFY_URL,
      orderId,
      orderInfo: rest.orderInfo,
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      requestId: rest.requestId,
      requestType: rest.requestType,
    });

    if (localSignature !== momoSignature) {
      return res.status(400).json({ EC: 1, EM: "Invalid signature" });
    }

    const paymentStatus = resultCode === 0 ? "success" : "failed";

    await db.Order.update(
      { status: paymentStatus === "success" ? "completed" : "failed" },
      { where: { orderId } },
    );

    await db.Payment.update(
      {
        status: paymentStatus,
        responseCode: resultCode,
        responseMessage: rest.message,
        paidAt: paymentStatus === "success" ? new Date() : null,
      },
      { where: { orderId } },
    );

    return res
      .status(200)
      .json({ EC: 0, EM: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error in MoMo callback:", error);
    res.status(500).json({ EC: 1, EM: "Error processing webhook" });
  }
};

export default {
  createMomoQr,
  checkPaymentStatus,
  getOrderInfo,
  momoCallback,
};

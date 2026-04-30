import crypto from "crypto";
import db from "../models/index";

// MoMo Sandbox Configuration
const MOMO_CONFIG = {
  SANDBOX_URL: "https://test-payment.momo.vn/v2/gateway/api/create",
  PARTNER_CODE: "MOMOIQA20210410",
  ACCESS_KEY: "lS0P6Gw9eX7t5vJ2",
  SECRET_KEY: "PcY4iIIZChotachvqbtjWaIt923ak77",
  REDIRECT_URL: `${process.env.FE_URL || "http://localhost:5173"}/payment`,
  NOTIFY_URL: `${process.env.BE_URL || "http://localhost:8080"}/api/payment/webhook`,
};

// Tạo signature cho MoMo request
const generateMomoSignature = (data) => {
  const signatureData = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      return acc + `${key}=${data[key]}&`;
    }, "");

  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.SECRET_KEY)
    .update(signatureData.slice(0, -1))
    .digest("hex");

  return signature;
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

    // Tạo request data cho MoMo
    const momoRequest = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      partnerTransId: orderId,
      phoneNumber: "0912345678",
      amount: Math.floor(amount),
      orderId: orderId,
      orderInfo: description || `Thanh toán cho ${productName}`,
      redirectUrl: MOMO_CONFIG.REDIRECT_URL,
      ipnUrl: MOMO_CONFIG.NOTIFY_URL,
      lang: "vi",
      autoCapture: true,
      requestId: `${MOMO_CONFIG.PARTNER_CODE}-${Date.now()}`,
      requestType: "captureMoMoQrCode",
      storeId: "CREATIMIC_STORE",
      extraData: JSON.stringify({
        userId,
        productId,
        quantity,
      }),
    };

    // Tạo signature
    const signature = generateMomoSignature(momoRequest);
    momoRequest.signature = signature;

    // Lưu order vào database
    await db.Order.create({
      orderId,
      userId,
      productId,
      quantity,
      amount,
      status: "pending",
      paymentMethod,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
    });

    // Tạo Payment record
    await db.Payment.create({
      orderId,
      paymentMethod,
      status: "pending",
      amount,
    });

    // Trong Sandbox mode, tạo QR code template
    // Thực tế sẽ gọi MoMo API
    const mockQrCode = generateMockQrCode(momoRequest);

    res.status(200).json({
      EC: 0,
      EM: "Tạo QR Code thành công",
      DT: {
        orderId,
        qrCode: mockQrCode,
        amount,
        description: momoRequest.orderInfo,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error("Error creating MoMo QR:", error);
    res.status(500).json({
      EC: 1,
      EM: "Lỗi khi tạo QR Code",
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

    // Lấy order từ database
    const order = await db.Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        EC: 1,
        EM: "Không tìm thấy đơn hàng",
        DT: null,
      });
    }

    // Kiểm tra nếu đơn hàng đã hết hạn
    if (order.expiresAt < new Date()) {
      order.status = "cancelled";
      await order.save();

      return res.status(200).json({
        EC: 0,
        EM: "Lấy trạng thái thành công",
        DT: {
          orderId,
          status: "cancelled",
        },
      });
    }

    // Mocking: 30% xác suất thanh toán thành công
    // Trong thực tế, sẽ check status từ MoMo callback hoặc database
    if (order.status === "pending") {
      const randomStatus = Math.random();

      if (randomStatus > 0.7) {
        order.status = "completed";
        await order.save();

        // Cập nhật Payment record
        await db.Payment.update(
          { status: "success", paidAt: new Date() },
          { where: { orderId } },
        );
      }
    }

    res.status(200).json({
      EC: 0,
      EM: "Lấy trạng thái thành công",
      DT: {
        orderId,
        status: order.status,
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

    // Lấy thông tin từ database
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

    res.status(200).json({
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

// MoMo Webhook callback
export const momoCallback = async (req, res) => {
  try {
    const { orderId, resultCode, extraData } = req.body;

    // Verify signature
    const signature = generateMomoSignature(req.body);

    if (signature !== req.body.signature) {
      return res.status(400).json({
        EC: 1,
        EM: "Invalid signature",
      });
    }

    // resultCode === 0 là thành công
    const paymentStatus = resultCode === 0 ? "success" : "failed";

    // Cập nhật Order status
    await db.Order.update(
      { status: paymentStatus === "success" ? "completed" : "failed" },
      { where: { orderId } },
    );

    // Cập nhật Payment record
    await db.Payment.update(
      {
        status: paymentStatus,
        responseCode: resultCode,
        responseMessage: req.body.message,
        paidAt: paymentStatus === "success" ? new Date() : null,
      },
      { where: { orderId } },
    );

    res.status(200).json({
      EC: 0,
      EM: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Error in MoMo callback:", error);
    res.status(500).json({
      EC: 1,
      EM: "Error processing webhook",
    });
  }
};

// Helper function: Tạo mock QR code cho Sandbox
const generateMockQrCode = (data) => {
  // Tạo SVG QR code data URL cho Sandbox
  // Trong thực tế, sẽ gọi qrcode library
  const qrContent = JSON.stringify({
    method: "QRCODE",
    qrType: "MERCHANT_PRESENTED_QR",
    merchantId: data.partnerCode,
    amount: data.amount,
    currency: "VND",
    description: data.orderInfo,
  });

  // Encoded base64 image (mock QR code)
  const mockQrDataUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='white'/%3E%3Ctext x='150' y='150' text-anchor='middle' font-size='14' font-family='Arial'%3E%3Ctspan x='150' dy='0'%3EMoMo QR Code%3C/tspan%3E%3Ctspan x='150' dy='20'%3E(Sandbox Mode)%3C/tspan%3E%3Ctspan x='150' dy='20'%3E%24" +
    encodeURIComponent(data.amount) +
    "%3C/tspan%3E%3Ctspan x='150' dy='20'%3EOrder: " +
    encodeURIComponent(data.orderId.substring(0, 20)) +
    "%3C/tspan%3E%3C/text%3E%3C/svg%3E";

  return mockQrDataUrl;
};

export default {
  createMomoQr,
  checkPaymentStatus,
  getOrderInfo,
  momoCallback,
};

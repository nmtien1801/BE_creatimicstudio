import { v4 as uuidv4 } from "uuid";
import db from "../../models/index.js";
import { getIo } from "../../socket.js";
import PayOS from "@payos/node";

// Khởi tạo PayOS client
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY,
);

const createOrder = async (req, res) => {
  const { totalAmount, description, items } = req.body;

  const amount = Number(totalAmount);
  if (!amount || amount <= 0)
    return res
      .status(400)
      .json({ success: false, message: "Số tiền không hợp lệ" });

  const safeAddInfo = String(description || `Thanh toan ${Date.now()}`)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 25);

  // PayOS yêu cầu orderCode là số nguyên dương
  const orderCode = Date.now(); // hoặc dùng nanoid số
  const orderId = `POS-${orderCode}`;
  const transactionId = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Tạo payment link từ PayOS
  const payosBody = {
    orderCode,
    amount,
    description: safeAddInfo,
    items: items?.map((i) => ({
      name: i.name,
      quantity: i.qty ?? i.quantity ?? 1,
      price: i.price,
    })) || [{ name: safeAddInfo, quantity: 1, price: amount }],
    returnUrl: process.env.PAYOS_RETURN_URL,
    cancelUrl: process.env.PAYOS_CANCEL_URL,
    expiredAt: Math.floor(expiresAt.getTime() / 1000), // Unix timestamp
  };

  const paymentLinkRes = await payos.createPaymentLink(payosBody);
  // paymentLinkRes = { checkoutUrl, qrCode, paymentLinkId, ... }

  // Lưu DB
  await db.Order.create({
    orderId,
    amount,
    status: "pending",
    paymentMethod: "vietqr",
    notes: safeAddInfo,
    expiresAt,
  });
  await db.Payment.create({
    orderId,
    transactionId,
    paymentMethod: "vietqr",
    status: "pending",
    responseMessage: safeAddInfo,
    amount,
  });

  res.status(201).json({
    success: true,
    order: {
      orderId,
      transactionId,
      totalAmount: amount,
      status: "pending",
      expiresAt: expiresAt.toISOString(),
    },
    payment: {
      qrImageUrl: paymentLinkRes.qrCode, // ✅ QR dạng base64 hoặc URL
      checkoutUrl: paymentLinkRes.checkoutUrl, // ✅ Link mở trang thanh toán PayOS
      deeplink: paymentLinkRes.checkoutUrl, // Dùng lại deeplink slot cho frontend
      description: safeAddInfo,
    },
  });
};

const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const order = await db.Order.findByPk(orderId);
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });

  if (
    order.status === "pending" &&
    order.expiresAt &&
    new Date(order.expiresAt) < new Date()
  ) {
    order.status = "cancelled";
    await order.save();
  }

  const payment = await db.Payment.findOne({
    where: { orderId },
    order: [["createdAt", "DESC"]],
  });
  res.json({ success: true, order, payment });
};

const confirmPayment = async (req, res) => {
  const { orderId } = req.params;
  const order = await db.Order.findByPk(orderId);

  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });

  if (
    order.status === "pending" &&
    order.expiresAt &&
    new Date(order.expiresAt) < new Date()
  ) {
    order.status = "cancelled";
    await order.save();
  }

  if (order.status === "completed") {
    return res.json({
      success: true,
      message: "Đơn hàng đã được xác nhận qua Webhook.",
      orderStatus: order.status,
      order,
    });
  }

  if (order.status === "failed" || order.status === "cancelled") {
    return res.status(409).json({
      success: false,
      message: "Đơn hàng đã không thành công hoặc đã hết hạn.",
      orderStatus: order.status,
      order,
    });
  }

  // Không cho phép client tự động hoàn tất giao dịch.
  // Trạng thái completed chỉ được cập nhật khi webhook xác nhận tiền đã vào tài khoản.
  return res.status(202).json({
    success: false,
    message:
      "Hệ thống chưa nhận được tiền từ ngân hàng. Vui lòng đợi webhook xác nhận.",
    orderStatus: order.status,
    order,
  });
};

const handleWebhook = async (req, res) => {
  // ✅ Verify chữ ký PayOS
  let webhookData;
  try {
    webhookData = payos.verifyPaymentWebhookData(req.body);
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Chữ ký webhook không hợp lệ" });
  }

  const { orderCode, code } = webhookData;
  const orderId = `POS-${orderCode}`;
  const isPaid = code === "00"; // PayOS: "00" = thành công

  const order = await db.Order.findByPk(orderId);
  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });

  if (order.status === "completed")
    return res.json({ success: true, message: "Đã xử lý trước đó" });

  const newOrderStatus = isPaid ? "completed" : "failed";
  order.status = newOrderStatus;
  await order.save();

  await db.Payment.update(
    {
      status: isPaid ? "success" : "failed",
      paidAt: isPaid ? new Date() : null,
      responseMessage: `PayOS webhook: ${code}`,
    },
    { where: { orderId } },
  );

  const io = getIo();
  if (io) {
    io.to(orderId).emit("payment-completed", {
      success: isPaid,
      message: isPaid ? "Tiền đã về tài khoản." : "Thanh toán thất bại.",
      status: newOrderStatus,
      orderId,
    });
  }

  res.json({ success: true });
};

export default { createOrder, getOrderById, confirmPayment, handleWebhook };

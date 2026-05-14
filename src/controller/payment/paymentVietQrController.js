import { v4 as uuidv4 } from "uuid";
import db from "../../models/index.js";
import { getIo } from "../../socket.js";

const createOrder = async (req, res) => {
  const { totalAmount, description, bankBin, accountNo, accountName } =
    req.body;

  const amount = Number(totalAmount);
  if (!amount || amount <= 0)
    return res
      .status(400)
      .json({ success: false, message: "Số tiền không hợp lệ" });
  if (!bankBin || !accountNo)
    return res
      .status(400)
      .json({ success: false, message: "Thông tin ngân hàng là bắt buộc" });

  const safeAddInfo = String(description || `Thanh toan ${Date.now()}`)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 25);
  const orderId = `VRQ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const transactionId = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

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

  const qrImageUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${safeAddInfo}${accountName ? `&accountName=${accountName}` : ""}`;
  const deeplink = `https://dl.vietqr.io/pay?bank=${bankBin}&acc=${accountNo}&amount=${amount}&desc=${safeAddInfo}${accountName ? `&name=${accountName}` : ""}`;

  // CHỖ NHÚNG PAYOS:
  // const paymentLinkRes = await payos.createPaymentLink(body);
  // qrImageUrl = paymentLinkRes.qrCode;
  // orderId = paymentLinkRes.orderCode;

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
      qrImageUrl,
      deeplink,
      bankInfo: { bankBin, accountNo, accountName },
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
  const { orderId, status } = req.body;

  if (!orderId || !status)
    return res
      .status(400)
      .json({ success: false, message: "Payload webhook không hợp lệ" });

  const order = await db.Order.findByPk(orderId);

  if (!order)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy đơn hàng" });

  const normalizedStatus = String(status).toLowerCase();
  const isPaid =
    normalizedStatus === "paid" || normalizedStatus === "completed";
  const newOrderStatus = isPaid
    ? "completed"
    : normalizedStatus === "failed"
      ? "failed"
      : "pending";

  if (order.status === "completed") {
    return res.json({
      success: true,
      message: "Đơn hàng đã được xử lý trước đó",
    });
  }

  order.status = newOrderStatus;
  await order.save();

  await db.Payment.update(
    {
      status: isPaid ? "success" : newOrderStatus,
      paidAt: isPaid ? new Date() : null,
      responseMessage: `Webhook update: ${status}`,
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

  res.json({ success: true, message: "Webhook processed successfully" });
};

export default { createOrder, getOrderById, confirmPayment, handleWebhook };

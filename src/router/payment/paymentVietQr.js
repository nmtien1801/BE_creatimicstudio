import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// In-memory order store (use a real DB in production)
const orders = new Map();

/**
 * POST /api/payment/create-order
 * Tạo đơn hàng và sinh mã QR thanh toán
 */
router.post('/create-order', asyncHandler(async (req, res) => {
  const {
    items,
    totalAmount,
    description,
    customerInfo,
    bankBin,
    accountNo,
    accountName,
  } = req.body;

  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
  }
  if (!bankBin || !accountNo) {
    return res.status(400).json({ success: false, message: 'Thông tin ngân hàng là bắt buộc' });
  }

  const orderId = `ORD${Date.now().toString().slice(-8)}`;
  const transactionId = uuidv4();
  const addInfo = description || `Thanh toan ${orderId}`;

  // Truncate addInfo to 25 chars for VietQR
  const safeAddInfo = addInfo.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 25);

  const order = {
    orderId,
    transactionId,
    items: items || [],
    totalAmount,
    description: safeAddInfo,
    customerInfo: customerInfo || {},
    bankBin,
    accountNo,
    accountName: accountName || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
  };

  orders.set(orderId, order);

  // Build Quick Link QR URL (no API key required)
  const qrParams = new URLSearchParams({
    amount: totalAmount,
    addInfo: safeAddInfo,
  });
  if (accountName) qrParams.set('accountName', accountName);

  const qrImageUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?${qrParams.toString()}`;

  // Build VietQR deeplink for banking apps
  const deeplink = buildVietQRDeeplink({ bankBin, accountNo, accountName, amount: totalAmount, addInfo: safeAddInfo });

  res.status(201).json({
    success: true,
    order: {
      orderId,
      transactionId,
      totalAmount,
      description: safeAddInfo,
      status: 'pending',
      expiresAt: order.expiresAt,
    },
    payment: {
      qrImageUrl,
      deeplink,
      bankInfo: { bin: bankBin, accountNo, accountName },
    },
  });
}));

/**
 * GET /api/payment/order/:orderId
 * Kiểm tra trạng thái đơn hàng
 */
router.get('/order/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = orders.get(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }

  // Check expiry
  if (new Date() > new Date(order.expiresAt) && order.status === 'pending') {
    order.status = 'expired';
    orders.set(orderId, order);
  }

  res.json({ success: true, order });
}));

/**
 * POST /api/payment/confirm/:orderId
 * Xác nhận thanh toán (demo - trong thực tế dùng webhook từ bank)
 */
router.post('/confirm/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = orders.get(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  }
  if (order.status !== 'pending') {
    return res.status(409).json({ success: false, message: `Đơn hàng đã ở trạng thái: ${order.status}` });
  }

  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  orders.set(orderId, order);

  res.json({ success: true, message: 'Thanh toán thành công', order });
}));

/**
 * GET /api/payment/deeplink
 * Tạo deeplink mở app ngân hàng
 */
router.get('/deeplink', asyncHandler(async (req, res) => {
  const { bankBin, accountNo, accountName, amount, addInfo } = req.query;

  if (!bankBin || !accountNo) {
    return res.status(400).json({ success: false, message: 'bankBin và accountNo là bắt buộc' });
  }

  const deeplink = buildVietQRDeeplink({ bankBin, accountNo, accountName, amount, addInfo });
  res.json({ success: true, deeplink });
}));

// Helper: Build VietQR deeplink for banking apps
function buildVietQRDeeplink({ bankBin, accountNo, accountName, amount, addInfo }) {
  const params = new URLSearchParams();
  params.set('bank', bankBin);
  params.set('acc', accountNo);
  if (accountName) params.set('name', accountName);
  if (amount) params.set('amount', amount);
  if (addInfo) params.set('desc', addInfo);

  return `https://dl.vietqr.io/pay?${params.toString()}`;
}

export default router;

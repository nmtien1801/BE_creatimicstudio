import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import vietqrClient from '../utils/vietqrClient.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Validation helper
const validateQRPayload = ({ accountNo, acqId, amount, addInfo }) => {
  const errors = [];

  if (!accountNo || String(accountNo).length < 6 || String(accountNo).length > 19) {
    errors.push('Số tài khoản phải từ 6 đến 19 ký tự');
  }
  if (!acqId) {
    errors.push('Mã ngân hàng (acqId/BIN) là bắt buộc');
  }
  if (amount !== undefined && amount !== null && amount !== '') {
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0 || String(amount).length > 13) {
      errors.push('Số tiền không hợp lệ (tối đa 13 chữ số, phải dương)');
    }
  }
  if (addInfo && addInfo.length > 25) {
    errors.push('Nội dung chuyển tiền tối đa 25 ký tự');
  }

  return errors;
};

/**
 * POST /api/qr/generate
 * Tạo mã QR VietQR thông qua API chính thức
 */
router.post('/generate', asyncHandler(async (req, res) => {
  const {
    accountNo,
    accountName,
    acqId,
    amount,
    addInfo,
    template = 'compact2',
    format = 'text',
  } = req.body;

  // Validate
  const errors = validateQRPayload({ accountNo, acqId, amount, addInfo });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors });
  }

  const payload = {
    accountNo: String(accountNo),
    accountName: accountName || '',
    acqId: Number(acqId),
    format,
    template,
  };

  if (amount) payload.amount = Number(amount);
  if (addInfo) payload.addInfo = addInfo;

  const { data } = await vietqrClient.post('/generate', payload);

  if (data.code !== '00') {
    return res.status(502).json({ success: false, message: data.desc, code: data.code });
  }

  res.json({
    success: true,
    transactionId: uuidv4(),
    data: {
      qrCode: data.data.qrCode,
      qrDataURL: data.data.qrDataURL,
      accountName: data.data.accountName,
      acqId: data.data.acpId,
    },
  });
}));

/**
 * GET /api/qr/quick-link
 * Tạo Quick Link URL (không cần API key)
 */
router.get('/quick-link', asyncHandler(async (req, res) => {
  const { bankId, accountNo, template = 'compact2', amount, addInfo, accountName } = req.query;

  if (!bankId || !accountNo) {
    return res.status(400).json({
      success: false,
      message: 'bankId và accountNo là bắt buộc',
    });
  }

  const params = new URLSearchParams();
  if (amount) params.set('amount', amount);
  if (addInfo) params.set('addInfo', encodeURIComponent(addInfo));
  if (accountName) params.set('accountName', encodeURIComponent(accountName));

  const queryString = params.toString();
  const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png${queryString ? '?' + queryString : ''}`;

  res.json({ success: true, url });
}));

export default router;

// import { Router } from 'express';
// import NodeCache from 'node-cache';
// import vietqrClient from '../utils/vietqrClient.js';
// import { asyncHandler } from '../middleware/errorHandler.js';

// const router = Router();
// const cache = new NodeCache({ stdTTL: 86400 }); // 24h cache

// /**
//  * GET /api/banks
//  * Lấy danh sách ngân hàng hỗ trợ VietQR
//  */
// router.get('/', asyncHandler(async (req, res) => {
//   const cached = cache.get('banks');
//   if (cached) {
//     return res.json({ success: true, fromCache: true, data: cached });
//   }

//   const { data } = await vietqrClient.get('/banks');

//   if (data.code !== '00') {
//     return res.status(502).json({ success: false, message: data.desc });
//   }

//   // Filter to only transfer-supported banks by default
//   const banks = data.data;
//   cache.set('banks', banks);

//   res.json({
//     success: true,
//     fromCache: false,
//     total: banks.length,
//     data: banks,
//   });
// }));

// /**
//  * GET /api/banks/transfer
//  * Chỉ lấy ngân hàng hỗ trợ chuyển tiền
//  */
// router.get('/transfer', asyncHandler(async (req, res) => {
//   const cacheKey = 'banks_transfer';
//   const cached = cache.get(cacheKey);
//   if (cached) {
//     return res.json({ success: true, fromCache: true, data: cached });
//   }

//   const { data } = await vietqrClient.get('/banks');

//   if (data.code !== '00') {
//     return res.status(502).json({ success: false, message: data.desc });
//   }

//   const banks = data.data.filter((b) => b.transferSupported === 1);
//   cache.set(cacheKey, banks);

//   res.json({
//     success: true,
//     fromCache: false,
//     total: banks.length,
//     data: banks,
//   });
// }));

// export default router;

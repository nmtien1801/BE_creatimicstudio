import express from "express";
import banksController from "../../controller/payment/banksController.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

const router = express.Router();

// Lấy toàn bộ danh sách ngân hàng
router.get("/", asyncHandler(banksController.getAllBanks));

// Chỉ lấy các ngân hàng hỗ trợ chuyển khoản nhanh
router.get("/transfer", asyncHandler(banksController.getTransferBanks));

export default router;

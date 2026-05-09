import express from "express";
import banksController from "../../controller/payment/banksController.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

const router = express.Router();

const banksApi = (app) => {
  // Lấy toàn bộ danh sách ngân hàng
  router.get("/banks", asyncHandler(banksController.getAllBanks));

  // Chỉ lấy các ngân hàng hỗ trợ chuyển khoản nhanh
  router.get("/banks/transfer", asyncHandler(banksController.getTransferBanks));

  return app.use("/api", router);
};

export default banksApi;

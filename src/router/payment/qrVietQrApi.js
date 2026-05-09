import express from "express";
import qrController from "../../controller/payment/qrVietQrController.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

const router = express.Router();

router.post("/generate", asyncHandler(qrController.generateQR));
router.get("/quick-link", asyncHandler(qrController.getQuickLink));

const ApiQrVietQr = (app) => {
  return app.use("/api/qr", router);
};

export default ApiQrVietQr;
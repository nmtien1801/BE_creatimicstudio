import express from "express";
import paymentController from "../../controller/payment/paymentVietQrController.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

const router = express.Router();

router.post("/create-order", asyncHandler(paymentController.createOrder));
router.get("/order/:orderId", asyncHandler(paymentController.getOrderById));
router.post(
  "/confirm/:orderId",
  asyncHandler(paymentController.confirmPayment),
);
router.post("/webhook", asyncHandler(paymentController.handleWebhook));

const ApiPaymentVietQr = (app) => {
  return app.use("/api/payment/vietqr", router);
};

export default ApiPaymentVietQr;

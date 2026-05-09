import express from "express";
import paymentController from "../../controller/payment/paymentMomoController";
import { checkUserJwt } from "../../middleware/jwtAction";

const router = express.Router();

const ApiPayment = (app) => {
  // middleware
  router.use(checkUserJwt);

  // Tạo QR Code MoMo
  router.post("/payment/momo/create-qr", paymentController.createMomoQr);
  // Kiểm tra trạng thái thanh toán
  router.get(
    "/payment/check-status/:orderId",
    paymentController.checkPaymentStatus,
  );
  // Lấy thông tin đơn hàng
  router.get("/payment/order/:orderId", paymentController.getOrderInfo);

  return app.use("/api", router);
};

export default ApiPayment;

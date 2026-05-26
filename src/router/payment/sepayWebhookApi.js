import express from "express";
import sepayWebhookController from "../../controller/payment/sepayWebhookController.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * 🔐 SEPAY WEBHOOK ROUTER
 * ============================================================
 * Routing cho Sepay Payment Integration
 *
 * Endpoints:
 * - POST /api/payment/sepay/create-order      : Tạo order mới
 * - POST /api/payment/sepay/webhook           : Webhook từ Sepay (PUBLIC - NO AUTH)
 * - GET  /api/payment/sepay/order/:orderId    : Check status
 * - POST /api/payment/sepay/confirm/:orderId  : Manual confirm (testing)
 */

const router = express.Router();

// ✅ Create new order with VietQR
router.post("/create-order", asyncHandler(sepayWebhookController.createOrder));

// ✅ Webhook endpoint - PUBLIC (không require auth vì Sepay gọi)
// ⚠️ CRITICAL: Phải verify signature trong controller
router.post("/webhook", asyncHandler(sepayWebhookController.handleWebhook));

// ✅ Get order status
router.get(
  "/order/:orderId",
  asyncHandler(sepayWebhookController.getOrderStatus),
);

// ✅ Manual confirm payment (for testing)
router.post(
  "/confirm/:orderId",
  asyncHandler(sepayWebhookController.confirmPayment),
);

const ApiPaymentSepay = (app) => {
  return app.use("/api/payment/sepay", router);
};

export default ApiPaymentSepay;

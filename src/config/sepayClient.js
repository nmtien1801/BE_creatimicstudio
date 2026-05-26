import axios from "axios";

/**
 * 🔐 SEPAY CLIENT CONFIGURATION
 * ============================================================
 * Sepay là cổng thanh toán VietQR + Ngân hàng
 * API Docs: https://sandbox.sepay.vn/docs
 *
 * SECURITY NOTES:
 * - Tất cả requests phải verify signature bằng X-Signature header
 * - X-Signature = HMAC-SHA256(request_body, API_SECRET)
 * - Webhook phải được xác thực trước khi xử lý
 * - Không bao giờ log sensitive data như account number
 * ============================================================
 */

const SEPAY_API_BASE =
  process.env.SEPAY_API_ENV === "production"
    ? "https://api.sepay.vn"
    : "https://sandbox-api.sepay.vn";

const SEPAY_WEBHOOK_BASE =
  process.env.SEPAY_WEBHOOK_ENV === "production"
    ? process.env.SEPAY_WEBHOOK_URL ||
      "https://yoursite.com/api/payment/sepay/webhook"
    : "http://localhost:8080/api/payment/sepay/webhook";

const sepayClient = axios.create({
  baseURL: SEPAY_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SEPAY_API_KEY || ""}`,
  },
  timeout: 10000,
});

/**
 * 🔐 Middleware: Xác thực response từ Sepay
 */
sepayClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Sepay API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default sepayClient;
export { SEPAY_API_BASE, SEPAY_WEBHOOK_BASE };

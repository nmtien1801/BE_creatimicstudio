/**
 * 🔐 RAW BODY MIDDLEWARE
 * ============================================================
 * FIX: Dùng req.originalUrl thay vì req.path
 *
 * req.path chỉ chứa phần path sau mount point của router.
 * Nếu app được mount với prefix (app.use('/api', router)),
 * req.path sẽ là "/payment/sepay/webhook" chứ không phải
 * "/api/payment/sepay/webhook" — nên check sẽ không khớp.
 *
 * req.originalUrl luôn chứa full path kể từ root.
 * ============================================================
 */

export const rawBodyMiddleware = (req, res, next) => {
  // ✅ FIX: Dùng originalUrl để match đúng dù router được mount ở bất kỳ prefix nào
  if (req.originalUrl?.includes("/api/payment/sepay/webhook")) {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      req.rawBody = data;
      try {
        req.body = JSON.parse(data || "{}");
      } catch {
        // ✅ FIX: Xử lý trường hợp body không phải JSON hợp lệ
        req.body = {};
      }
      next();
    });
    req.on("error", (err) => {
      console.error("❌ rawBodyMiddleware stream error:", err.message);
      next(err);
    });
  } else {
    next();
  }
};

export default rawBodyMiddleware;
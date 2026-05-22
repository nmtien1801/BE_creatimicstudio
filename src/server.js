require("dotenv").config();
import express from "express";
import configCORS from "./config/cors";
import cookieParser from "cookie-parser";
import http from "http";
import dbPool from "./config/Pool.js";
import { initSocket } from "./socket.js";
const path = require("path");

// Routers
import authApi from "./router/authApi";
import ApiStaff from "./router/staffApi";
import ApiProduct from "./router/productApi";
import ApiCategory from "./router/categoryApi";
import ApiProductCategory from "./router/productCategoryApi";
import ApiUPload from "./router/fileApi";
import ApiPost from "./router/postApi";
import ApiRecruitment from "./router/recruitmentApi";
import ApiContact from "./router/contactApi";
import ApiProductImage from "./router/productImageApi";
import UserCutVideoRoutes from "./router/userCutVideoApi";
import ApiPaymentMomo from "./router/payment/paymentMomoApi";
import ApiPaymentVietQr from "./router/payment/paymentVietQrApi";
import ApiBanks from "./router/payment/banksApi";
import ApiQrVietQr from "./router/payment/qrVietQrApi";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

// Kiểm tra kết nối Pool khi khởi động server
dbPool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Lỗi kết nối PostgreSQL Pool:", err.message);
  } else {
    console.log("✅ Kết nối PostgreSQL Pool thành công tại:", res.rows[0].now);
  }
});

// ==========================================
// 1. ROUTE XỬ LÝ BOT PRERENDER (ĐẶT LÊN ĐẦU)
// ==========================================

const parseProductRequestUri = (originalUrl) => {
  const rawPath =
    originalUrl.split("?")[0].replace(/^\/bot-prerender/, "") || "/";
  const normalizedPath = rawPath.replace(/\/+$/, "");
  const segments = normalizedPath.split("/").filter(Boolean);
  const result = {
    requestUri: normalizedPath || "/",
    productSlug: "",
    id: "",
  };

  // Nếu URL dạng /:productSlug/all/:id
  if (segments.length >= 3 && segments[1] === "all") {
    result.productSlug = segments[0];
    result.id = segments[2];
  } else if (segments.length >= 1) {
    result.productSlug = segments[0];
    result.id = segments[segments.length - 1];
  }

  return result;
};

const buildAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return "https://cmicstudio.vn/logo.png";
  const trimmed = imagePath.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://cmicstudio.vn${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
};

const getProductBySlug = async (slug) => {
  const normalizedSlug = String(slug || "")
    .trim()
    .toLowerCase();
  if (!normalizedSlug) return null;

  const isNumericId = /^\d+$/.test(normalizedSlug);

  // Câu lệnh truy vấn SQL giữ nguyên cấu trúc của bạn
  const queryText = isNumericId
    ? `SELECT id, name AS title, description AS short_description, image AS thumbnail_url
       FROM "Products"
       WHERE id = $1 OR "maSP" = $1 OR REPLACE(LOWER(unaccent(name)), ' ', '-') = $1
       LIMIT 1`
    : `SELECT id, name AS title, description AS short_description, image AS thumbnail_url
       FROM "Products"
       WHERE "maSP" = $1 OR REPLACE(LOWER(unaccent(name)), ' ', '-') = $1
       LIMIT 1`;

  // CHỐT HẠ: Nếu là ID số (như "92"), ép kiểu hẳn sang Integer để Postgres so khớp chính xác
  const queryParam = isNumericId
    ? parseInt(normalizedSlug, 10)
    : normalizedSlug;

  console.log(`[BOT DEBUG] Đang tìm kiếm sản phẩm với tham số:`, queryParam);

  const { rows } = await dbPool.query(queryText, [queryParam]);

  if (rows.length > 0) {
    console.log(`[BOT DEBUG] 🎉 Tìm thấy sản phẩm thật:`, rows[0].title);
  } else {
    console.log(
      `[BOT DEBUG] ❌ Không tìm thấy sản phẩm nào khớp với tham số trên trong DB.`,
    );
  }

  return rows[0] || null;
};

const renderBotHtml = ({ title, description, imageUrl, url }) => {
  const escapeHtml = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const safeTitle = escapeHtml(title) || "CMICSTUDIO";
  const safeDescription =
    escapeHtml(description) ||
    "CMIC Studio - Sản phẩm chất lượng, thiết kế chuyên nghiệp.";
  const safeImage = escapeHtml(imageUrl) || "https://cmicstudio.vn/logo.png";
  const safeUrl = escapeHtml(url) || "https://cmicstudio.vn";

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>
  </body>
</html>`;
};

const renderFallbackHtml = () => {
  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CMICSTUDIO</title>
    <meta property="og:title" content="CMICSTUDIO" />
    <meta property="og:description" content="CMIC Studio - Trang chủ chính thức, thiết kế website, quảng cáo, marketing." />
    <meta property="og:image" content="https://cmicstudio.vn/logo.png" />
    <meta property="og:url" content="https://cmicstudio.vn" />
    <meta property="og:type" content="website" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <h1>CMICSTUDIO</h1>
    <p>Thiết kế website và giải pháp marketing cho doanh nghiệp.</p>
  </body>
</html>`;
};

// Khai báo API Prerender ngay lập tức để bỏ qua các tầng bóc tách middleware không cần thiết của Bot
app.get("/bot-prerender/*path", async (req, res) => {
  const { requestUri, productSlug, id } = parseProductRequestUri(
    req.originalUrl,
  );
  const queryKey = id || productSlug;

  if (!queryKey) {
    return res.status(200).send(renderFallbackHtml());
  }

  try {
    const product = await getProductBySlug(queryKey);
    if (!product) {
      return res.status(200).send(renderFallbackHtml());
    }

    const imageUrl = buildAbsoluteImageUrl(product.thumbnail_url);
    const productUrl = `https://cmicstudio.vn${requestUri}`;

    return res.status(200).send(
      renderBotHtml({
        title: product.title,
        description: product.short_description || product.title,
        imageUrl,
        url: productUrl,
      }),
    );
  } catch (error) {
    console.error("[BOT PRERENDER] Lỗi khi truy vấn sản phẩm:", error);
    return res.status(200).send(renderFallbackHtml());
  }
});

// ==========================================
// 2. CÁC CẤU HÌNH MIDDLEWARE & FILE TĨNH THÔNG THƯỜNG
// ==========================================
configCORS(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Đã sửa: Đồng bộ linh hoạt giữa biến môi trường UPLOAD_PATH (.env) và thư mục tương đối dự phòng
app.use(
  "/api/upload",
  express.static(
    process.env.UPLOAD_PATH || path.join(__dirname, "..", "upload"),
  ),
);

// ==========================================
// 3. KHAI BÁO CÁC ROUTER HỆ THỐNG
// ==========================================
authApi(app);
ApiStaff(app);
ApiProduct(app);
ApiCategory(app);
ApiProductCategory(app);
ApiUPload(app);
ApiPost(app);
ApiRecruitment(app);
ApiContact(app);
ApiProductImage(app);
UserCutVideoRoutes(app);
ApiPaymentMomo(app);
ApiBanks(app);
ApiPaymentVietQr(app);
ApiQrVietQr(app);

// ==========================================
// 4. KHỞI CHẠY SERVER
// ==========================================
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

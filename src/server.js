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
  const cleanPath = originalUrl.split("?")[0];

  // Bỏ prefix /bot-prerender khỏi URL thật để đưa về dạng path của người dùng
  const realPath = cleanPath.replace(/^\/bot-prerender/, "") || "/";

  const segments = realPath.split("/").filter(Boolean);

  const result = {
    requestUri: realPath,
    productSlug: "",
    id: "",
  };

  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    const isNumeric = /^\d+$/.test(lastSegment);

    if (isNumeric) {
      result.id = lastSegment;
      if (segments.length >= 3 && segments[segments.length - 2] === "all") {
        result.productSlug = segments[segments.length - 3];
      } else {
        result.productSlug = segments[segments.length - 2] || "";
      }
    } else {
      result.productSlug = lastSegment;
    }
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

  // Luồng xử lý tìm kiếm bằng ID
  if (isNumericId) {
    const numericId = parseInt(normalizedSlug, 10);
    console.log(
      `[BOT DEBUG] 🔎 Đang truy vấn bằng ID (Số nguyên): ${numericId}`,
    );

    // ✅ ĐÃ KHỬ 'S': Đổi tên bảng thành "Product" theo đúng ý bạn
    const { rows } = await dbPool.query(
      `SELECT id, name AS title, description AS short_description, image AS thumbnail_url 
       FROM "Product" 
       WHERE id = $1 
       LIMIT 1`,
      [numericId],
    );

    if (rows.length > 0) {
      console.log(`[BOT DEBUG] 🎉 Tìm thấy sản phẩm bằng ID:`, rows[0].title);
    }
    return rows[0] || null;
  }

  // Luồng xử lý tìm kiếm bằng Chuỗi (slug/maSP)
  console.log(
    `[BOT DEBUG] 🔎 Đang truy vấn bằng Chuỗi (Slug/maSP): "${normalizedSlug}"`,
  );

  // ✅ ĐÃ KHỬ 'S': Đổi tên bảng thành "Product" theo đúng ý bạn
  const { rows } = await dbPool.query(
    `SELECT id, name AS title, description AS short_description, image AS thumbnail_url 
     FROM "Product" 
     WHERE "maSP" = $1 OR REPLACE(LOWER(unaccent(name)), ' ', '-') = $1 
     LIMIT 1`,
    [normalizedSlug],
  );

  if (rows.length > 0) {
    console.log(
      `[BOT DEBUG] 🎉 Tìm thấy sản phẩm bằng Slug/maSP:`,
      rows[0].title,
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

  console.log("-----------------------------------------");
  console.log(`[BOT INSPECT] URL nhận được từ Nginx: ${req.originalUrl}`);
  console.log(`[BOT INSPECT] Sau xử lý -> requestUri thực tế: "${requestUri}"`);
  console.log(
    `[BOT INSPECT] Bóc tách dữ liệu -> ID: "${id}", Slug: "${productSlug}"`,
  );

  if (!queryKey) {
    return res.status(200).send(renderFallbackHtml());
  }

  try {
    const product = await getProductBySlug(queryKey);
    if (!product) {
      console.log(
        `[BOT INSPECT] ❌ Không tìm thấy sản phẩm trong DB, chạy về Fallback.`,
      );
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
    console.error("[BOT PRERENDER] Lỗi hệ thống khi truy vấn sản phẩm:", error);
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

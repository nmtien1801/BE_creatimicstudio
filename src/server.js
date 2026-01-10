require("dotenv").config();
import express from "express";
import configCORS from "./config/cors";
import cookieParser from "cookie-parser";

// Routers
import authApi from "./router/authApi";
import ApiStaff from "./router/staffApi";
import ApiProduct from "./router/productApi";
import ApiCategory from "./router/categoryApi";
import ApiProductCategory from "./router/productCategoryApi";
import ApiUPload from "./router/fileApi";
import ApiPost from "./router/postApi";
import ApiRecruitment from "./router/recruitmentApi";
// const corsMiddleware = require("./config/cors");

const app = express();

configCORS(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// connectDB();

authApi(app);
ApiStaff(app);
ApiProduct(app);
ApiCategory(app);
ApiProductCategory(app);
ApiUPload(app);
ApiPost(app);
ApiRecruitment(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

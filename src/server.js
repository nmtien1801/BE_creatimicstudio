require("dotenv").config();
import express from "express";
import configCORS from "./config/cors";
import cookieParser from "cookie-parser";

// Routers
import authApi from "./router/authApi";
import ApiStaff from "./router/staffApi";
// const corsMiddleware = require("./config/cors");

const app = express();

configCORS(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// connectDB();

authApi(app);
ApiStaff(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

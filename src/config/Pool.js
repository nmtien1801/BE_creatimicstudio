import { Pool } from "pg";

const pgConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  max: 20, // Tối đa 20 kết nối dùng chung trong pool
  idleTimeoutMillis: 30000, // Tự động giải phóng kết nối rảnh sau 30s
  connectionTimeoutMillis: 2000, // Timeout kết nối sau 2s nếu DB treo
};

const pool = new Pool(pgConfig);

// Thêm error handler để tránh crash server
pool.on("error", (err) => {
  console.error("❌ PostgreSQL Pool lỗi bất ngờ:", err.message);
});

// Xuất instance pool này ra để dùng chung toàn hệ thống
export default pool;
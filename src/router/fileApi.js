const express = require("express");
const multer = require("multer");
const path = require("path");
const fileController = require("../controller/fileController");

const router = express.Router();

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Lưu vào thư mục upload trước, sau đó di chuyển đến thư mục cuối cùng
    cb(null, path.join(__dirname, "../../upload"));
  },
  filename: (req, file, cb) => {
    // Giữ nguyên tên file, sẽ đổi tên trong service
    cb(null, file.originalname);
  },
});

// Filter để kiểm tra loại file (tùy chọn)
const fileFilter = (req, file, cb) => {
  // Chấp nhận tất cả các loại file hoặc lọc theo yêu cầu
  // const allowedMimes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
  // if (allowedMimes.includes(file.mimetype)) {
  //     cb(null, true);
  // } else {
  //     cb(new Error('Invalid file type'), false);
  // }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 90 * 1024 * 1024, // 90MB
  },
});

const ApiUPload = (app) => {
  // POST - Upload file
  router.post("/file/upload", upload.single("myFiles"), fileController.uploadFile);

  // GET - Lấy file
  router.get("/file/getFile", fileController.getFile);

  // DELETE - Xóa file
  router.delete("/file/deleteFile", fileController.deleteFile);

  return app.use("/api", router);
};

export default ApiUPload;

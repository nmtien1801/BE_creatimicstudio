const fileService = require("../service/fileService");
const path = require("path");
require("dotenv").config();
const Upload_Path = process.env.UPLOAD_PATH || process.cwd();

// Upload file
const uploadFile = async (req, res) => {
  try {
    // Kiểm tra xem có file được upload không
    if (!req.file) {
      return res.status(400).json({
        EM: "No file uploaded",
      });
    }

    // Lấy đường dẫn từ config
    const uploadPath = Upload_Path;

    // Lưu file và lấy đường dẫn tương đối
    const filePath = fileService.saveFile(req.file, uploadPath);

    return res.status(200).json({
      EM: "File uploaded successfully",
      DT: filePath,
      EC: 0,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      EM: error.message || "Error uploading file",
      DT: null,
      EC: -1,
    });
  }
};

// Get file
const getFile = async (req, res) => {
  try {
    const { fileName } = req.query;

    if (!fileName) {
      return res.status(400).json({
        EM: "File name is required",
      });
    }

    // Lấy đường dẫn từ config
    const uploadPath = Upload_Path;

    // Lấy thông tin file
    const fileInfo = fileService.getFile(fileName, uploadPath);

    // Thiết lập headers
    res.setHeader("Content-Type", fileInfo.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(fileInfo.filePath)}"`
    );

    // Gửi file
    return res.sendFile(fileInfo.filePath);
  } catch (error) {
    console.error("Get file error:", error);
    return res.status(404).json({
      EM: error.message || "File not found",
      DT: null,
      EC: -1,
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        EM: "File name is required",
        EC: -1,
      });
    }

    // Lấy đường dẫn từ config
    const uploadPath = Upload_Path;

    // Xóa file
    const result = fileService.deleteFile(fileName, uploadPath);

    if (result) {
      return res.status(200).json({
        EM: "File deleted successfully",
        DT: null,
        EC: 0,
      });
    } else {
      return res.status(404).json({
        EM: "File not found",
        DT: null,
        EC: -1,
      });
    }
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({
      EM: error.message || "Error deleting file",
      DT: null,
      EC: -1,
    });
  }
};

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
};

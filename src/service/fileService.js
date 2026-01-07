const fs = require('fs');
const path = require('path');

// Hàm xác định Content Type dựa vào extension
const getContentType = (extension) => {
    const contentTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return contentTypes[extension?.toLowerCase()] || 'application/octet-stream';
};

// Hàm tạo timestamp
const getUnixTimestamp = () => {
    return Math.floor(Date.now() / 1000);
};

// Hàm tạo tên file mới với timestamp
const generateNewFileName = (originalFileName) => {
    const fileExtension = path.extname(originalFileName);
    const fileNameWithoutExt = path.basename(originalFileName, fileExtension);
    const timestamp = getUnixTimestamp();
    return `${fileNameWithoutExt}_${timestamp}${fileExtension}`;
};

// Hàm lưu file
const saveFile = (file, uploadPath) => {
    try {
        const fileName = file.originalname;
        const newFileName = generateNewFileName(fileName);
        const relativePath = `images/${newFileName}`;
        
        // Tạo thư mục nếu không tồn tại
        const uploadDir = path.join(uploadPath, 'images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Di chuyển file từ temp folder đến destination
        const tempPath = file.path;
        const destPath = path.join(uploadPath, relativePath);
        fs.renameSync(tempPath, destPath);

        return relativePath;
    } catch (error) {
        throw new Error(`Error saving file: ${error.message}`);
    }
};

// Hàm lấy file
const getFile = (fileName, uploadPath) => {
    try {
        const fullPath = path.join(uploadPath, fileName);
        
        // Kiểm tra file tồn tại
        if (!fs.existsSync(fullPath)) {
            throw new Error('File not found');
        }

        return {
            filePath: fullPath,
            contentType: getContentType(path.extname(fileName))
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Hàm xóa file
const deleteFile = (fileName, uploadPath) => {
    try {
        const fullPath = path.join(uploadPath, fileName);
        
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
        return false;
    } catch (error) {
        throw new Error(`Error deleting file: ${error.message}`);
    }
};

module.exports = {
    saveFile,
    getFile,
    deleteFile,
    getContentType,
    getUnixTimestamp,
    generateNewFileName
};

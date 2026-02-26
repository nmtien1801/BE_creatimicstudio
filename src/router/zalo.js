import express from "express";
import ZaloBot from "node-zalo-bot";
// Import các controller khác của bạn nếu cần

const router = express.Router();

const ApiZalo = (app) => {
  // 1. Sử dụng biến môi trường để bảo mật
  const TOKEN =
    process.env.ZALO_BOT_TOKEN ||
    "1347892305706177866:jPANHaYfpsxfgghSVecCrPHVahdlzmykpYCGQnFfADfkSLtIwfirRDtDmMXZlyoq";

  // 2. Khởi tạo bot (không tự mở port riêng để tránh xung đột)
  const bot = new ZaloBot(TOKEN, {
    polling: false, // Ép buộc tắt polling để không bị lỗi undefined
  });

  // 3. Logic xử lý khi có tin nhắn từ khách hàng
  bot.on("message", (msg) => {
    const fromId = msg.from.id; // Zalo dùng User ID
    const senderName = msg.from.display_name || "bạn";

    bot.sendMessage(
      fromId,
      `Chào ${senderName}! Creatimic Studio đã nhận được tin nhắn: "${msg.text}". Chúng tôi sẽ phản hồi sớm nhất.`,
    );
  });

  // 4. Endpoint Webhook
  // Lưu ý: Endpoint này KHÔNG nên đi qua middleware checkUserJwt vì Zalo gọi vào sẽ không có Token JWT của bạn
  app.post("/webhook", (req, res) => {
    // Chuyển dữ liệu từ Zalo sang cho thư viện bot xử lý
    bot.processUpdate(req.body);
    res.status(200).send("OK");
  });

  // Các route API khác của bạn (có thể dùng middleware ở đây)
  router.get("/zalo-status", (req, res) => {
    res.json({ status: "Bot is running" });
  });

  app.use("/api", router);
};

export default ApiZalo;

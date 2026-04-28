import express from "express";
import { sendMessage } from "../controller/zaloController";

const router = express.Router();

const ApiZalo = (app) => {
    // WEBHOOK: Zalo gọi vào đây
    app.post("/webhook", (req, res) => {
        const { event_name, sender, message } = req.body;

        if (event_name === "user_send_text") {
            const userOaId = sender.id;
            const userMsg = message.text;

            console.log(`Khách nhắn: ${userMsg}`);
            sendMessage(userOaId, `Creatimic đã nhận tin: ${userMsg}. Đợi tí nhé!`);
        }
        res.status(200).send("OK");
    });

    // API cho FE gọi để gửi tin nhắn chủ động
    router.post("/send-manual", async (req, res) => {
        const { userId, message } = req.body;
        await sendMessage(userId, message);
        res.json({ success: true });
    });

    app.use("/api/zalo", router);
};

export default ApiZalo;
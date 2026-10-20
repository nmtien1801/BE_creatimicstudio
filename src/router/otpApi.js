import crypto from "crypto";
import express from "express";
import {
  isValidVietnamesePhoneNumber,
  normalizeVietnamesePhoneNumber,
} from "../utils/phoneNumber.js";
import { OTP_TTL_MINUTES, sendSmsOtp } from "../controller/optController.js";

const router = express.Router();
const otpStore = new Map();
const OTP_TTL_MS = OTP_TTL_MINUTES * 60 * 1000; // 5 phút
const COOLDOWN_MS = 60 * 1000; // 60 giây

const otpApi = (app) => {
  router.post("/otp/send", async (req, res) => {
    const { phoneNumber } = req.body || {};

    if (!isValidVietnamesePhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại không hợp lệ." });
    }

    const normalizedPhoneNumber = normalizeVietnamesePhoneNumber(phoneNumber);
    const currentRecord = otpStore.get(normalizedPhoneNumber);

    // Chặn spam trong thời gian cooldown
    if (currentRecord && Date.now() - currentRecord.createdAt < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (COOLDOWN_MS - (Date.now() - currentRecord.createdAt)) / 1000,
      );
      return res.status(429).json({
        success: false,
        message: `Vui lòng đợi ${remainingSeconds} giây trước khi gửi lại mã.`,
      });
    }

    if (currentRecord?.timer) {
      clearTimeout(currentRecord.timer);
    }

    const otpCode = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
    const createdAt = Date.now();
    const expiresAt = createdAt + OTP_TTL_MS;

    const timer = setTimeout(() => {
      otpStore.delete(normalizedPhoneNumber);
    }, OTP_TTL_MS);

    otpStore.set(normalizedPhoneNumber, {
      otpCode,
      expiresAt,
      createdAt,
      attempts: 0,
      timer,
    });

    try {
      // Gửi trực tiếp qua SMS
      const result = await sendSmsOtp(normalizedPhoneNumber, otpCode);

      return res.status(200).json({
        success: true,
        message: "Mã OTP đã được gửi thành công qua tin nhắn SMS.",
        channel: result.channel,
        expiresAt,
      });
    } catch (error) {
      clearTimeout(timer);
      otpStore.delete(normalizedPhoneNumber);

      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi hệ thống gửi tin nhắn SMS.",
      });
    }
  });

  return app.use("/api", router);
};

export default otpApi;
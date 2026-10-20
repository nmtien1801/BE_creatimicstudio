import axios from "axios";

export const OTP_TTL_MINUTES = 5;

function getProviderErrorMessage(error) {
  const responseData = error?.response?.data;
  if (responseData?.ErrorMessage) return responseData.ErrorMessage;
  if (responseData?.message) return responseData.message;
  return error instanceof Error ? error.message : String(error);
}

/* ------------------------------------------------------------------ */
/* Gửi tin nhắn qua SMS Gateway (eSMS)                                */
/* ------------------------------------------------------------------ */
export async function sendSmsOtp(phoneNumber, otpCode) {
  const smsType = process.env.ESMS_SMS_TYPE?.trim();
  if (!smsType) {
    throw new Error(
      "ESMS_SMS_TYPE is not configured; set it to a type enabled for the eSMS account.",
    );
  }

  const phoneDigits = String(phoneNumber).replace(/\D/g, "");

  try {
    const response = await axios.post(
      "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json",
      {
        ApiKey: process.env.ESMS_API_KEY,
        SecretKey: process.env.ESMS_SECRET_KEY,
        Content: `Ma OTP cua ban la ${otpCode}. Ma co hieu luc trong ${OTP_TTL_MINUTES} phut.`,
        Phone: phoneDigits,
        SmsType: smsType,
        Brandname: process.env.ESMS_BRANDNAME || "",
      },
      { timeout: 7000 },
    );

    if (response.data?.CodeResult !== "100") {
      throw new Error(
        `SMS Gateway Error [SmsType=${smsType}, CodeResult=${response.data?.CodeResult}]: ${response.data?.ErrorMessage || "Unknown error"}`,
      );
    }

    return { channel: "SMS", success: true, data: response.data };
  } catch (error) {
    const message = getProviderErrorMessage(error);
    console.error(`[OTP] Gửi SMS thất bại tới ${phoneDigits}: ${message}`);
    throw new Error(message || "Không thể gửi tin nhắn SMS.");
  }
}
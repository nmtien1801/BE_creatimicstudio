// utils/phoneNumber.js

/**
 * Regex kiểm tra số điện thoại Việt Nam hợp lệ:
 * - Chấp nhận đầu số: 03, 05, 07, 08, 09
 * - Hỗ trợ các định dạng nhập vào:
 *   + 0xxxxxxxxx (10 chữ số)
 *   + 84xxxxxxxxx
 *   + +84xxxxxxxxx
 *   + Có chứa dấu cách hoặc dấu gạch nối (ví dụ: 0912 345 678, 0912-345-678)
 */
const VN_PHONE_REGEX = /^(?:\+?84|0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9\d)\d{7}$/;

/**
 * Kiểm tra xem chuỗi có phải là số điện thoại di động Việt Nam hợp lệ hay không.
 * @param {string} phoneNumber - Số điện thoại cần kiểm tra
 * @returns {boolean}
 */
export function isValidVietnamesePhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== "string" && typeof phoneNumber !== "number") {
    return false;
  }

  // Loại bỏ khoảng trắng và các ký tự phân tách phổ biến (- .)
  const cleanPhone = String(phoneNumber)
    .trim()
    .replace(/[\s.-]/g, "");

  return VN_PHONE_REGEX.test(cleanPhone);
}

/**
 * Chuẩn hóa số điện thoại về định dạng mong muốn.
 * @param {string} phoneNumber - Số điện thoại cần chuẩn hóa
 * @param {string} format - Định dạng đầu ra:
 *    - 'standard': Bắt đầu bằng '0' (ví dụ: 0912345678) -> thích hợp lưu DB, gửi SMS nội địa
 *    - 'zalo': Bắt đầu bằng '84' không có dấu '+' (ví dụ: 84912345678) -> chuẩn API Zalo ZNS
 *    - 'intl': Bắt đầu bằng '+84' (ví dụ: +84912345678) -> chuẩn quốc tế / Twilio
 * @returns {string}
 */
export function normalizeVietnamesePhoneNumber(
  phoneNumber,
  format = "standard",
) {
  if (!phoneNumber) return "";

  // Bỏ khoảng trắng, dấu ngoặc, gạch nối, dấu chấm
  let cleanPhone = String(phoneNumber)
    .trim()
    .replace(/[\s().-]/g, "");

  // Chuyển tất cả về dạng không có tiền tố quốc tế (bỏ +84 hoặc 84 ở đầu nếu có)
  if (cleanPhone.startsWith("+84")) {
    cleanPhone = cleanPhone.slice(3);
  } else if (cleanPhone.startsWith("84")) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.startsWith("0")) {
    cleanPhone = cleanPhone.slice(1);
  }

  // Tùy theo format yêu cầu để gắn lại tiền tố:
  switch (format) {
    case "zalo": // 84xxxxxxxxx
      return `84${cleanPhone}`;
    case "intl": // +84xxxxxxxxx
      return `+84${cleanPhone}`;
    case "standard": // 0xxxxxxxxx
    default:
      return `0${cleanPhone}`;
  }
}

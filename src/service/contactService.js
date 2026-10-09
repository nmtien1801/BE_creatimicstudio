import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

let getBodyHTMLContactEmail = (data = {}) => {
  const { name, phone, email, message } = data;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h3 style="color: #0056b3; margin-top: 0;">Thông tin liên hệ mới từ: ${name || "Khách hàng"}</h3>
      <p style="margin: 8px 0;"><strong>Số điện thoại:</strong> ${phone || "Chưa cung cấp"}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> ${email || "Chưa cung cấp"}</p>
      <p style="margin: 8px 0;">
        <strong>Nội dung tin nhắn:</strong><br/>
        <span style="display: inline-block; margin-top: 4px; padding: 10px; background-color: #f9f9f9; border-radius: 4px; border-left: 3px solid #0056b3; width: 100%; box-sizing: border-box; white-space: pre-wrap;">
          ${message || "Không có nội dung lời nhắn."}
        </span>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <div><b>Trân trọng!</b></div>
    </div>
  `;
};

let getBodyHTMLApplyEmail = (name, email, phone) => {
  return `
        <h3>Ứng viên gửi CV</h3>
        <p><strong>Họ tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Gửi kèm:</strong> CV đính kèm</p>
        <div> <b>Trân trọng!</b> </div>
      `;
};

let sendApplyEmail = async (name, email, phone, file) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "mail.creatimichub.vn", // Lấy ở mục Outgoing Server trong cPanel
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Giúp tránh một số lỗi handshake trên một số server
      },
    });

    const info = await transporter.sendMail({
      from: `"Ứng tuyển viên" <${process.env.HR_EMAIL}>`,
      to: process.env.HR_EMAIL, // 👈 mail HR
      subject: "Ứng tuyển - CV đính kèm",
      html: getBodyHTMLApplyEmail(name, email, phone),
      attachments: file
        ? [
            {
              filename: file.originalname,
              content: file.buffer,
              contentType: file.mimetype,
            },
          ]
        : [],
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("check Err send apply email: ", error);
    return { success: false, error: error.message };
  }
};

let sendContactEmail = async (data) => {
  try {
    const { name, phone, email, message } = data;

    const transporter = nodemailer.createTransport({
      host: "mail.cmicagency.vn", // Lấy ở mục Outgoing Server trong cPanel
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Giúp tránh lỗi handshake trên một số server
      },
    });

    const info = await transporter.sendMail({
      from: `"Tư vấn khách hàng" <${process.env.SEND_EMAIL}>`,
      to: process.env.SEND_EMAIL,
      subject: `[LIÊN HỆ MỚI] - ${name} - ${phone}`,
      html: getBodyHTMLContactEmail({
        name,
        phone,
        email,
        message,
      }),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("check Err send contact email: ", error);
    return { success: false, error: error.message };
  }
};

export default { sendContactEmail, sendApplyEmail };

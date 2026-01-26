import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

let getBodyHTMLContactEmail = (name, email, message) => {
  return `
        <h3> Thông tin liên hệ từ:  ${name}</h3>
        <p><strong>Email của tôi:</strong> ${email}</p>
        <p><strong>Tin nhắn:</strong></p>
        <p>${message}</p>
        <div> <b>Trân trọng!</b> </div>
      `;
};

let sendContactEmail = async (name, email, message) => {
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
      from: `"Tư vấn khách hàng" <${process.env.SEND_EMAIL}>`,
      to: process.env.ADMIN_EMAIL || process.env.SEND_EMAIL, // 👈 mail bạn
      subject: "Thông tin liên hệ từ khách hàng",
      html: getBodyHTMLContactEmail(name, email, message),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("check Err send contact email: ", error);
    return { success: false, error: error.message };
  }
};

export default { sendContactEmail };

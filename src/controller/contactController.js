import contactService from "../service/contactService.js";

const handleSendContact = async (req, res) => {
  try {
    const { name, phone, email, message } =
      req.body;

    // Validate các trường bắt buộc
    if (!email) {
      return res.status(400).json({
        EM: "Vui lòng nhập đầy đủ các thông tin bắt buộc!",
        EC: 1,
        DT: "",
      });
    }

    // Truyền toàn bộ object hoặc từng tham số vào service xử lý
    const contactData = {
      name,
      phone: phone || "",
      email,
      message
    };

    const result = await contactService.sendContactEmail(contactData);

    if (result.success) {
      return res.status(200).json({
        EM: "Gửi thông tin liên hệ thành công!",
        EC: 0,
        DT: result.data || result,
      });
    } else {
      return res.status(500).json({
        EM: "Lỗi gửi thông tin liên hệ",
        EC: -1,
        DT: result.error || "",
      });
    }
  } catch (error) {
    console.error("Error in handleSendContact:", error);
    return res.status(500).json({
      EM: "Lỗi hệ thống từ server (Error from server)",
      EC: -1,
      DT: "",
    });
  }
};

const handleApplyContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const file = req.file;

    if (!name || !email || !phone || !file) {
      return res.status(400).json({
        EM: "Thiếu thông tin bắt buộc (name, email, phone, file)",
        EC: 1,
        DT: "",
      });
    }

    const result = await contactService.sendApplyEmail(
      name,
      email,
      phone,
      file,
    );

    if (result.success) {
      return res.status(200).json({
        EM: "Gửi email ứng tuyển thành công",
        EC: 0,
        DT: result,
      });
    } else {
      return res.status(500).json({
        EM: "Lỗi gửi email ứng tuyển",
        EC: -1,
        DT: result.error,
      });
    }
  } catch (error) {
    console.error("Error in handleApplyContact:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

export default { handleSendContact, handleApplyContact };

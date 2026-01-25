import contactService from "../service/contactService.js";

const handleSendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        EM: "Thiếu thông tin bắt buộc",
        EC: 1,
        DT: "",
      });
    }

    const result = await contactService.sendContactEmail(name, email, message);

    if (result.success) {
      return res.status(200).json({
        EM: "Gửi email thành công",
        EC: 0,
        DT: result,
      });
    } else {
      return res.status(500).json({
        EM: "Lỗi gửi email",
        EC: -1,
        DT: result.error,
      });
    }
  } catch (error) {
    console.error("Error in handleSendContact:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

export default { handleSendContact };
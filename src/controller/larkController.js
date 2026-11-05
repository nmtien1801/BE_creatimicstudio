import larkService from "../service/larkService.js";

const handleSendNotify = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        EM: "Vui lòng nhập nội dung thông báo!",
        EC: 1,
        DT: "",
      });
    }

    const result = await larkService.sendText(message);

    if (result.success) {
      return res.status(200).json({
        EM: "Gửi thông báo Lark thành công!",
        EC: 0,
        DT: result.data,
      });
    } else {
      return res.status(500).json({
        EM: "Lỗi gửi thông báo Lark",
        EC: -1,
        DT: result.error || "",
      });
    }
  } catch (error) {
    console.error("Error in handleSendNotify:", error);
    return res.status(500).json({
      EM: "Lỗi hệ thống từ server (Error from server)",
      EC: -1,
      DT: "",
    });
  }
};

// ======================= Dùng 1 lần để lấy chat_id của nhóm "test" =========================
const handleGetChats = async (req, res) => {
  try {
    const result = await larkService.getChats();

    if (result.success) {
      return res.status(200).json({
        EM: "Lấy danh sách nhóm thành công!",
        EC: 0,
        DT: result.data,
      });
    } else {
      return res.status(500).json({
        EM: "Lỗi lấy danh sách nhóm",
        EC: -1,
        DT: result.error || "",
      });
    }
  } catch (error) {
    console.error("Error in handleGetChats:", error);
    return res.status(500).json({
      EM: "Lỗi hệ thống từ server (Error from server)",
      EC: -1,
      DT: "",
    });
  }
};

export default { handleSendNotify, handleGetChats };
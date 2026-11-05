require("dotenv").config();

const BASE_URL =
  process.env.LARK_BASE_URL || "https://open.larksuite.com/open-apis";

let cachedToken = { token: null, expireAt: 0 };

// Lấy tenant_access_token (có cache, tự làm mới khi gần hết hạn)
const getTenantToken = async () => {
  if (cachedToken.token && Date.now() < cachedToken.expireAt) {
    return cachedToken.token;
  }

  const res = await fetch(`${BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET,
    }),
  });

  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`Lark token error: ${data.msg} (code ${data.code})`);
  }

  cachedToken = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire - 300) * 1000, // trừ 5 phút cho an toàn
  };
  return cachedToken.token;
};

// Hàm gửi tin nhắn chung
const sendMessage = async (chatId, msgType, content) => {
  try {
    const token = await getTenantToken();

    const res = await fetch(`${BASE_URL}/im/v1/messages?receive_id_type=chat_id`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receive_id: chatId,
        msg_type: msgType,
        content: JSON.stringify(content),
      }),
    });

    const data = await res.json();
    if (data.code !== 0) {
      return { success: false, error: `${data.msg} (code ${data.code})` };
    }
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error in larkService.sendMessage:", error);
    return { success: false, error: error.message };
  }
};

// Gửi tin nhắn text đơn giản
const sendText = (text, chatId = process.env.LARK_CHAT_ID) =>
  sendMessage(chatId, "text", { text });

// Gửi thông báo liên hệ mới (dạng card cho đẹp)
const sendContactNotification = (contactData, chatId = process.env.LARK_CHAT_ID) => {
  const { name, phone, email, message } = contactData;

  const card = {
    config: { wide_screen_mode: true },
    header: {
      template: "blue",
      title: { tag: "plain_text", content: "📩 Có liên hệ mới từ website cmicstudio" },
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Họ tên:** ${name || "-----"}` } },
          { is_short: true, text: { tag: "lark_md", content: `**SĐT:** ${phone || "----"}` } },
          { is_short: false, text: { tag: "lark_md", content: `**Email:** ${email || "----"}` } },
          { is_short: false, text: { tag: "lark_md", content: `**Nội dung:**\n${message || "-----"}` } },
        ],
      },
      { tag: "hr" },
      {
        tag: "note",
        elements: [
          { tag: "plain_text", content: `Thời gian: ${new Date().toLocaleString("vi-VN")}` },
        ],
      },
    ],
  };

  return sendMessage(chatId, "interactive", card);
};

// Lấy danh sách nhóm bot đang tham gia (để lấy chat_id)
const getChats = async () => {
  try {
    const token = await getTenantToken();
    const res = await fetch(`${BASE_URL}/im/v1/chats?page_size=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.code !== 0) {
      return { success: false, error: `${data.msg} (code ${data.code})` };
    }
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error in larkService.getChats:", error);
    return { success: false, error: error.message };
  }
};

export default { sendText, sendContactNotification, getChats };
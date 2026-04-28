import axios from "axios";

// Lưu ý: Trong thực tế nên lưu những giá trị này vào Database hoặc Redis
let currentAccessToken = "";
let refreshToken = process.env.ZALO_REFRESH_TOKEN; 

const refreshZaloToken = async () => {
    try {
        const response = await axios.post('https://oauth.zalo.me/v2.0/access_token', new URLSearchParams({
            refresh_token: refreshToken,
            app_id: process.env.ZALO_APP_ID,
            grant_type: 'refresh_token'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'secret_key': process.env.ZALO_APP_SECRET }
        });

        if (response.data.access_token) {
            currentAccessToken = response.data.access_token;
            refreshToken = response.data.refresh_token; // Lưu lại để dùng cho lần sau
            console.log("Đã refresh Token Zalo thành công");
            return currentAccessToken;
        }
    } catch (error) {
        console.error("Lỗi Refresh Token:", error.response?.data || error.message);
    }
};

export const sendMessage = async (toId, text) => {
    try {
        await axios.post('https://openapi.zalo.me/v3.0/oa/message/transaction', 
        { recipient: { user_id: toId }, message: { text: text } },
        { headers: { access_token: currentAccessToken } });
    } catch (error) {
        if (error.response?.data?.error === -216) { // Token hết hạn
            await refreshZaloToken();
            return sendMessage(toId, text); // Gửi lại sau khi refresh
        }
        console.error("Gửi tin nhắn thất bại:", error.response?.data);
    }
};
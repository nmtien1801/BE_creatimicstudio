import { v4 as uuidv4 } from "uuid";
import vietqrClient from "../../config/vietqrClient.js";

const generateQR = async (req, res) => {
  const {
    accountNo,
    accountName,
    acqId,
    amount,
    addInfo,
    template = "compact2",
  } = req.body;

  const payload = {
    accountNo: String(accountNo),
    accountName: accountName || "",
    acqId: Number(acqId),
    template,
  };
  if (amount) payload.amount = Number(amount);
  if (addInfo) payload.addInfo = addInfo;

  const { data } = await vietqrClient.post("/generate", payload);
  if (data.code !== "00")
    return res.status(502).json({ success: false, message: data.desc });

  res.json({ success: true, transactionId: uuidv4(), data: data.data });
};

const getQuickLink = (req, res) => {
  const {
    bankId,
    accountNo,
    amount,
    addInfo,
    template = "compact2",
  } = req.query;
  const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount || ""}&addInfo=${addInfo || ""}`;
  res.json({ success: true, url });
};

export default { generateQR, getQuickLink };

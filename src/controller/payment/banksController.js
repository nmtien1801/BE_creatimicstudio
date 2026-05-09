import NodeCache from "node-cache";
import vietqrClient from "../../config/vietqrClient.js";

const cache = new NodeCache({ stdTTL: 86400 }); // 24h cache

const getAllBanks = async (req, res) => {
  const cached = cache.get("banks");
  if (cached) {
    return res.json({ success: true, fromCache: true, data: cached });
  }

  const { data } = await vietqrClient.get("/banks");

  if (data.code !== "00") {
    return res.status(502).json({ success: false, message: data.desc });
  }

  const banks = data.data;
  cache.set("banks", banks);

  res.json({
    success: true,
    fromCache: false,
    total: banks.length,
    data: banks,
  });
};

const getTransferBanks = async (req, res) => {
  const cacheKey = "banks_transfer";
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, fromCache: true, data: cached });
  }

  const { data } = await vietqrClient.get("/banks");

  if (data.code !== "00") {
    return res.status(502).json({ success: false, message: data.desc });
  }

  const banks = data.data.filter((b) => b.transferSupported === 1);
  cache.set(cacheKey, banks);

  res.json({
    success: true,
    fromCache: false,
    total: banks.length,
    data: banks,
  });
};

export default {
  getAllBanks,
  getTransferBanks,
};

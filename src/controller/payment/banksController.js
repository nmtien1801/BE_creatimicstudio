import vietqrClient from "../../config/vietqrClient.js";

// Simple in-memory cache as fallback (node-cache optional)
class SimpleCache {
  constructor(ttl = 86400) {
    this.cache = new Map();
    this.ttl = ttl * 1000;
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;
    if (Date.now() > item.exp) {
      this.cache.delete(key);
      return undefined;
    }
    return item.val;
  }
  set(key, val) {
    this.cache.set(key, { val, exp: Date.now() + this.ttl });
  }
}

const cache = new SimpleCache(86400); // 24h cache

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

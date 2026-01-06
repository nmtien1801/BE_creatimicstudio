import authService from "../service/authService.js";
import {
  createToken,
  verifyRefreshToken,
  verifyToken,
} from "../middleware/jwtAction";
import dotenv from "dotenv";
dotenv.config();

const handleLogin = async (req, res) => {
  try {
    let data = await authService.handleLogin(req.body);

    if (data.EC !== 0) {
      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }

    const { accessToken, refreshToken } = createToken(data.DT);

    // set cookie
    res.cookie("fr", accessToken, {
      httpOnly: false, // chỉ cho phép server đọc cookie, không cho client
      secure: false,
      maxAge: +process.env.JWT_REFRESH_EXPIRES_TOKEN,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // chỉ cho phép server đọc cookie, không cho client
      secure: false,
      maxAge: +process.env.JWT_REFRESH_EXPIRES_TOKEN + 86400000,
    });

    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in handleLogin:", error);
    return res.status(500).json({
      EM: "Error from server login",
      EC: -1,
      DT: "",
    });
  }
};

const handleRegister = async (req, res) => {
  try {
    let data = await authService.handleRegister(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in handleRegister:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

const handleRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ EC: -1, EM: "Missing refresh token" });
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return res.status(401).json({ EC: -1, EM: "Invalid refresh token" });
  }

  const { accessToken, refreshToken: newRefreshToken } = createToken({
    id: decoded.id,
    userName: decoded.userName,
    email: decoded.email,
    phone: decoded.phone,
    role: decoded.role,
    address: decoded.address,
    image: decoded.image,
  });

  // set cookie mới
  res.cookie("fr", accessToken, {
    httpOnly: false, // chỉ cho phép server đọc cookie, không cho client
    secure: false,
    maxAge: +process.env.JWT_REFRESH_EXPIRES_TOKEN,
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: +process.env.JWT_REFRESH_EXPIRES_TOKEN + 86400000,
  });

  return res.status(200).json({
    EC: 0,
    EM: "Token refreshed successfully",
    DT: { accessToken },
  });
};

const fetchAccount = async (req, res) => {
  try {
    let decoded = verifyToken(req.cookies.fr);

    return res.status(200).json({
      EM: "ok fetch context",
      EC: 0,
      DT: decoded,
    });
  } catch (error) {
    console.error("Error in fetchAccount:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    let userID = req.headers["userid"];

    const data = await authService.changePassword(userID, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error changePassword:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateProfile = async (req, res) => {
  try {
    let userID = req.headers["userid"];

    const data = await authService.updateProfile(userID, req.body);

    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updateProfile:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getListUser = async (req, res) => {
  try {
    const data = await authService.getListUser(req.query);

    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListUser:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

module.exports = {
  handleLogin,
  handleRegister,
  handleRefreshToken,
  fetchAccount,
  changePassword,
  updateProfile,
  getListUser,
};

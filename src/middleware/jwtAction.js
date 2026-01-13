import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const createToken = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // token sống 15 phút
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_TOKEN, // token sống 7 ngày
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  const key = process.env.JWT_SECRET;
  try {
    return jwt.verify(token, key);
  } catch (error) {
    console.log(">>>check err verify token: ", error.message);
    if (error.name === "TokenExpiredError") {
      return "TokenExpiredError"; // jwt hết hạn
    }
    return null;
  }
};

// refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
};

const nonSecurePaths = [
  /^\/$/,
  /^\/auth\/login$/,
  /^\/auth\/logout$/,
  /^\/auth\/register$/,
  /^\/auth\/refreshToken$/,
  /^\/recruitment\/list$/,
  /^\/recruitment\/byRecruitmentId\/[^/]+$/,
  /^\/file\/getFile/,
];

// lấy token từ header Authorization: Bearer <token>
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// middleware kiểm tra JWT
const checkUserJwt = async (req, res, next) => {
  // kh check middleware url (2)
  if (nonSecurePaths.some((pattern) => pattern.test(req.path))) {
    return next();
  }
  let cookies = req.cookies;
  let tokenFromHeader = extractToken(req);

  if ((cookies && cookies.fr) || tokenFromHeader) {
    // bug vừa vào đã check quyền xác thực khi chưa login của Context
    let accessToken = cookies && cookies.fr ? cookies.fr : tokenFromHeader;
    let decoded = verifyToken(accessToken);

    if (decoded && decoded !== "TokenExpiredError") {
      req.user = decoded; // gán thêm .user(data cookie) vào req BE nhận từ FE
      req.fr = accessToken; // gán thêm .token(data cookie) vào req BE nhận từ FE
      req.refreshToken = cookies.refreshToken; // gán thêm .token(data cookie) vào req BE nhận từ FE
      next();
    } else if (decoded === "TokenExpiredError") {
      if (cookies && cookies.refreshToken) {
        // Retry(FE) nếu lỗi là 403 -> vì token refresh chưa kịp /api/account -> retry để lấy token mới
        return res.status(403).json({
          EC: -1,
          DT: "",
          EM: "need to retry with new token",
        });
      } else {
        return res.status(401).json({
          EC: -1,
          DT: "",
          EM: "Not authenticated the user(token accessToken)",
        });
      }
    } else {
      return res.status(401).json({
        EC: -1,
        DT: "",
        EM: "Not authenticated the user(token accessToken)",
      });
    }
  }
  // ngược lại khi không có cookies or header thì trả ra lỗi không xác thực
  else {
    return res.status(401).json({
      EC: -1,
      DT: "",
      EM: "Not authenticated the user(accessToken | JWT)",
    });
  }
};

export { createToken, verifyToken, checkUserJwt, verifyRefreshToken };

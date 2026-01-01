import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import dotenv from "dotenv";
import { add } from "lodash";
dotenv.config();

// ====================== Helper ======================
const salt = bcrypt.genSaltSync(10);

const hashPassword = (password) => {
  return bcrypt.hashSync(password, salt);
};

const checkPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

// ====================== Check Exists ======================
const checkPhoneExists = async (phone) => {
  const user = await db.User.findOne({ where: { phone } });
  return !!user;
};

const checkEmailExists = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  return !!user;
};

// ====================== REGISTER ======================
const handleRegister = async (rawData) => {
  try {
    const isEmailExists = await checkEmailExists(rawData.email);
    if (isEmailExists) {
      return {
        EM: "Email already exists",
        EC: 1,
        DT: "",
      };
    }

    const isPhoneExists = await checkPhoneExists(rawData.phone);
    if (isPhoneExists) {
      return {
        EM: "Phone number already exists",
        EC: 1,
        DT: "",
      };
    }

    const newUser = await db.User.create({
      userName: rawData.username,
      email: rawData.email,
      password: hashPassword(rawData.password),
      phone: rawData.phone,
      address: rawData.address,
      role: rawData.role || "client",
      image: rawData.image || "",
    });

    return {
      EM: "Register successfully",
      EC: 0,
      DT: {
        id: newUser.id,
        email: newUser.email,
        userName: newUser.userName,
      },
    };
  } catch (error) {
    console.log(">>> Error Register:", error);
    return {
      EM: "Something went wrong in service (register)",
      EC: -2,
      DT: "",
    };
  }
};

// ====================== LOGIN ======================
const handleLogin = async (rawData) => {
  try {
    const user = await db.User.findOne({
      where: {
        [Op.or]: [
          { email: rawData.username }, // login bằng email
          { phone: rawData.username }, // login bằng phone
        ],
      },
    });

    if (!user) {
      return {
        EM: "Email hoặc số điện thoại không tồn tại",
        EC: 1,
        DT: "",
      };
    }

    const isPasswordCorrect = checkPassword(rawData.password, user.password);
    if (!isPasswordCorrect) {
      return {
        EM: "Mật khẩu hoặc tài khoản không đúng",
        EC: 1,
        DT: "",
      };
    }

    return {
      EM: "Login successfully",
      EC: 0,
      DT: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        image: user.image,
      },
    };
  } catch (error) {
    console.log(">>> Error Login:", error);
    return {
      EM: "Something went wrong in service (login)",
      EC: -2,
      DT: "",
    };
  }
};

const changePassword = async (userID, rawData) => {
  try {
    let user = await db.User.findOne({ where: { id: userID } });
    if (!user) {
      return { EM: "Không tìm thấy người dùng", EC: 1, DT: "" };
    }

    const isPasswordCorrect = checkPassword(rawData.PassWordOld, user.password);
    if (!isPasswordCorrect) {
      return { EM: "Mật khẩu cũ không chính xác", EC: 1, DT: "" };
    }

    const hashedNewPassword = hashPassword(rawData.PassWordNew);
    await user.update({ password: hashedNewPassword });

    return { EM: "Đổi mật khẩu thành công", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Lỗi đổi mật khẩu:", error);
    return { EM: "Error from service (changePassword)", EC: -1, DT: "" };
  }
};

const updateProfile = async (userID, rawData) => {
  try {
    let user = await db.User.findOne({ where: { id: userID } });
    if (!user) {
      return { EM: "Không tìm thấy người dùng", EC: 1, DT: "" };
    }

    await user.update({
      userName: rawData.userName,
      phone: rawData.phone,
      email: rawData.email,
      address: rawData.address,
    });

    return { EM: "Cập nhật hồ sơ thành công", EC: 0, DT: user };
  } catch (error) {
    console.error(">>> Lỗi cập nhật hồ sơ:", error);
    return { EM: "Error from service (updateProfile)", EC: -1, DT: "" };
  }
};

// ====================== EXPORT ======================
export default {
  handleRegister,
  handleLogin,
  changePassword,
  updateProfile
};

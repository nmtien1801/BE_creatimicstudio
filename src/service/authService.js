import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize"
import dotenv from "dotenv";
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
        EM: "Email or phone not found",
        EC: 1,
        DT: "",
      };
    }

    const isPasswordCorrect = checkPassword(rawData.password, user.password);
    if (!isPasswordCorrect) {
      return {
        EM: "Incorrect password",
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

// ====================== EXPORT ======================
export default {
  handleRegister,
  handleLogin,
};

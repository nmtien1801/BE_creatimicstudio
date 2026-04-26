import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
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
const checkUserNameExists = async (userName) => {
  const user = await db.UserCutVideo.findOne({ where: { userName } });
  return !!user;
};

// ====================== GET LIST ======================
const getList = async () => {
  try {
    const list = await db.UserCutVideo.findAll({
      attributes: { exclude: ["password"] },
    });
    if (list && list.length > 0) {
      return {
        EM: "Get list success",
        EC: 0,
        DT: list,
      };
    } else {
      return {
        EM: "No users found",
        EC: 0,
        DT: [],
      };
    }
  } catch (error) {
    console.log("Error in getList:", error);
    return {
      EM: "Error from server",
      EC: -1,
      DT: "",
    };
  }
};

// ====================== CREATE ======================
const createUser = async (rawData) => {
  try {
    const isUserNameExists = await checkUserNameExists(rawData.userName);
    if (isUserNameExists) {
      return {
        EM: "Username already exists",
        EC: 1,
        DT: "",
      };
    }

    if (!rawData.userName || !rawData.password) {
      return {
        EM: "Missing required fields: userName and password",
        EC: 1,
        DT: "",
      };
    }

    const newUser = await db.UserCutVideo.create({
      userName: rawData.userName,
      password: hashPassword(rawData.password),
    });

    return {
      EM: "Create user success",
      EC: 0,
      DT: newUser,
    };
  } catch (error) {
    console.log("Error in createUser:", error);
    return {
      EM: "Error from server",
      EC: -1,
      DT: "",
    };
  }
};

// ====================== UPDATE ======================
const updateUser = async (userId, rawData) => {
  try {
    if (!userId) {
      return {
        EM: "User ID is required",
        EC: 1,
        DT: "",
      };
    }

    const user = await db.UserCutVideo.findByPk(userId);
    if (!user) {
      return {
        EM: "User not found",
        EC: 1,
        DT: "",
      };
    }

    if (rawData.userName) {
      const isUserNameExists = await checkUserNameExists(rawData.userName);
      if (isUserNameExists && rawData.userName !== user.userName) {
        return {
          EM: "Username already exists",
          EC: 1,
          DT: "",
        };
      }
      user.userName = rawData.userName;
    }

    if (rawData.password) {
      user.password = hashPassword(rawData.password);
    }

    await user.save();

    return {
      EM: "Update user success",
      EC: 0,
      DT: user,
    };
  } catch (error) {
    console.log("Error in updateUser:", error);
    return {
      EM: "Error from server",
      EC: -1,
      DT: "",
    };
  }
};

// ====================== DELETE ======================
const deleteUser = async (userId) => {
  try {
    if (!userId) {
      return {
        EM: "User ID is required",
        EC: 1,
        DT: "",
      };
    }

    const user = await db.UserCutVideo.findByPk(userId);
    if (!user) {
      return {
        EM: "User not found",
        EC: 1,
        DT: "",
      };
    }

    await user.destroy();

    return {
      EM: "Delete user success",
      EC: 0,
      DT: "",
    };
  } catch (error) {
    console.log("Error in deleteUser:", error);
    return {
      EM: "Error from server",
      EC: -1,
      DT: "",
    };
  }
};

// ====================== LOGIN ======================
const handleLogin = async (rawData) => {
  try {
    if (!rawData.userName || !rawData.password) {
      return {
        EM: "Missing required fields",
        EC: 1,
        DT: "",
      };
    }

    const user = await db.UserCutVideo.findOne({
      where: { userName: rawData.userName },
    });

    if (!user) {
      return {
        EM: "Username or password is invalid",
        EC: 1,
        DT: "",
      };
    }

    const isPasswordValid = checkPassword(rawData.password, user.password);
    if (!isPasswordValid) {
      return {
        EM: "Username or password is invalid",
        EC: 1,
        DT: "",
      };
    }

    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    return {
      EM: "Login success",
      EC: 0,
      DT: userWithoutPassword,
    };
  } catch (error) {
    console.log("Error in handleLogin:", error);
    return {
      EM: "Error from server",
      EC: -1,
      DT: "",
    };
  }
};

export default {
  getList,
  createUser,
  updateUser,
  deleteUser,
  handleLogin,
};

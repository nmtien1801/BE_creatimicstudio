import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

const salt = bcrypt.genSaltSync(10);
const hashPassword = (password) => bcrypt.hashSync(password, salt);

const checkPhoneExists = async (phone, excludeUserId = null) => {
  const where = { phone };
  if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
  const user = await db.User.findOne({ where });
  return !!user;
};

const checkEmailExists = async (email, excludeUserId = null) => {
  const where = { email };
  if (excludeUserId) where.id = { [Op.ne]: excludeUserId };
  const user = await db.User.findOne({ where });
  return !!user;
};

const getListStaff = async () => {
  try {
    const users = await db.User.findAll({ attributes: { exclude: ["password"] }, where: { role: "staff" } });

    return { EM: "Get list success", EC: 0, DT: users };
  } catch (error) {
    return { EM: "Error from service (getListStaff)", EC: -1, DT: "" };
  }
};

const createStaff = async (rawData) => {
  try {
    const email = rawData.email;
    const phone = rawData.phone;

    if (email) {
      const isEmailExists = await checkEmailExists(email);
      if (isEmailExists) return { EM: "Email already exists", EC: 1, DT: "" };
    }

    if (phone) {
      const isPhoneExists = await checkPhoneExists(phone);
      if (isPhoneExists) return { EM: "Phone number already exists", EC: 1, DT: "" };
    }

    const newUser = await db.User.create({
      userName: rawData.userName || rawData.username || "",
      email: email || "",
      password: rawData.password ? hashPassword(rawData.password) : "",
      phone: phone || "",
      address: rawData.address || "",
      role: rawData.role || "staff",
      image: rawData.image || "",
    });

    const { password, ...userSafe } = newUser.dataValues;

    return { EM: "Create staff success", EC: 0, DT: userSafe };
  } catch (error) {
    console.error(">>> Error createStaff:", error);
    return { EM: "Error from service (createStaff)", EC: -1, DT: "" };
  }
};

const updateStaff = async (id, rawData) => {
  try {
    const user = await db.User.findByPk(id);
    if (!user) return { EM: "User not found", EC: 1, DT: "" };

    if (rawData.email) {
      const exists = await checkEmailExists(rawData.email, id);
      if (exists) return { EM: "Email already in use", EC: 1, DT: "" };
    }

    if (rawData.phone) {
      const exists = await checkPhoneExists(rawData.phone, id);
      if (exists) return { EM: "Phone already in use", EC: 1, DT: "" };
    }

    const updates = {
      userName: rawData.userName ?? rawData.username ?? user.userName,
      email: rawData.email ?? user.email,
      phone: rawData.phone ?? user.phone,
      address: rawData.address ?? user.address,
      role: rawData.role ?? user.role,
      image: rawData.image ?? user.image,
    };

    if (rawData.password) updates.password = hashPassword(rawData.password);

    await user.update(updates);
    const { password, ...userSafe } = user.dataValues;
    return { EM: "Update success", EC: 0, DT: userSafe };
  } catch (error) {
    console.error(">>> Error updateStaff:", error);
    return { EM: "Error from service (updateStaff)", EC: -1, DT: "" };
  }
};

const deleteStaff = async (id) => {
  try {
    const user = await db.User.findByPk(id);
    if (!user) return { EM: "User not found", EC: 1, DT: "" };
    await user.destroy();
    return { EM: "Delete success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error deleteStaff:", error);
    return { EM: "Error from service (deleteStaff)", EC: -1, DT: "" };
  }
};

export default {
  getListStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};

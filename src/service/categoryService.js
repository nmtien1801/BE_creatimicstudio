import db from "../models/index.js";
import { Op } from "sequelize";

const getListCategory = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.name) where.name = { [Op.like]: `%${query.name}%` };

    const categories = await db.Category.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name"]
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name"]
        }
      ]
    });

    // 🔹 Lấy tổng ALL (không limit)
    const total = await db.Category.count({ where });

    return {
      EM: "Get category list success",
      EC: 0,
      DT: { categories, total, page, limit },
    };
  } catch (error) {
    console.error(">>> Error getListCategory:", error);
    return { EM: "Error from service (getListCategory)", EC: -1, DT: "" };
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await db.Category.findByPk(id, {
      include: [
        {
          model: db.Category,
          as: "parent",
          attributes: ["id", "name"]
        },
        {
          model: db.Category,
          as: "children",
          attributes: ["id", "name", "icon", "status"]
        }
      ]
    });
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };
    return { EM: "Get category success", EC: 0, DT: category };
  } catch (error) {
    console.error(">>> Error getCategoryById:", error);
    return { EM: "Error from service (getCategoryById)", EC: -1, DT: "" };
  }
};

const createCategory = async (rawData) => {
  try {
    const newCategory = await db.Category.create({
      name: rawData.name || "",
      icon: rawData.icon || "",
      status: rawData.status ?? true,
      parentId: rawData.parentId || null
    });

    return { EM: "Create category success", EC: 0, DT: newCategory };
  } catch (error) {
    console.error(">>> Error createCategory:", error);
    return { EM: "Error from service (createCategory)", EC: -1, DT: "" };
  }
};

const updateCategory = async (id, rawData) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };

    const updates = {
      name: rawData.name ?? category.name,
      icon: rawData.icon ?? category.icon,
      status: rawData.status ?? category.status,
      parentId: rawData.parentId ?? category.parentId
    };

    await category.update(updates);
    return { EM: "Update category success", EC: 0, DT: category };
  } catch (error) {
    console.error(">>> Error updateCategory:", error);
    return { EM: "Error from service (updateCategory)", EC: -1, DT: "" };
  }
};

const deleteCategory = async (id) => {
  try {
    const category = await db.Category.findByPk(id);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };
    await category.destroy();
    return { EM: "Delete category success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error deleteCategory:", error);
    return { EM: "Error from service (deleteCategory)", EC: -1, DT: "" };
  }
};

export default {
  getListCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

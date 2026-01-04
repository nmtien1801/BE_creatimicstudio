import db from "../models/index.js";
import { Op } from "sequelize";

const getListProduct = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.name) where.name = { [Op.like]: `%${query.name}%` };

    const products = await db.Product.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // 🔹 Lấy tổng ALL (không limit)
    const total = await db.Product.count({ where });

    return {
      EM: "Get product list success",
      EC: 0,
      DT: { products, total, page, limit },
    };
  } catch (error) {
    console.error(">>> Error getListProduct:", error);
    return { EM: "Error from service (getListProduct)", EC: -1, DT: "" };
  }
};

const getProductById = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };
    return { EM: "Get product success", EC: 0, DT: product };
  } catch (error) {
    console.error(">>> Error getProductById:", error);
    return { EM: "Error from service (getProductById)", EC: -1, DT: "" };
  }
};

const createProduct = async (rawData) => {
  try {
    const newProduct = await db.Product.create({
      name: rawData.name || "",
      image: rawData.image || "",
      description: rawData.description || "",
      detail: rawData.detail || "",
      price: rawData.price ?? 0,
      status: rawData.status ?? true,
    });

    return { EM: "Create product success", EC: 0, DT: newProduct };
  } catch (error) {
    console.error(">>> Error createProduct:", error);
    return { EM: "Error from service (createProduct)", EC: -1, DT: "" };
  }
};

const updateProduct = async (id, rawData) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };

    const updates = {
      name: rawData.name ?? product.name,
      image: rawData.image ?? product.image,
      description: rawData.description ?? product.description,
      detail: rawData.detail ?? product.detail,
      price: rawData.price ?? product.price,
      status: rawData.status ?? product.status,
    };

    await product.update(updates);
    return { EM: "Update product success", EC: 0, DT: product };
  } catch (error) {
    console.error(">>> Error updateProduct:", error);
    return { EM: "Error from service (updateProduct)", EC: -1, DT: "" };
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };
    await product.destroy();
    return { EM: "Delete product success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error deleteProduct:", error);
    return { EM: "Error from service (deleteProduct)", EC: -1, DT: "" };
  }
};

const getListProductDropdown = async () => {
  try {
    const products = await db.Product.findAll();
    return { EM: "Get product list success", EC: 0, DT: products };
  } catch (error) {
    console.error(">>> Lỗi getListProductDropdown:", error);
    return {
      EM: "Error from service (getListProductDropdown)",
      EC: -1,
      DT: "",
    };
  }
};

export default {
  getListProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getListProductDropdown,
};

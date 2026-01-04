import db from "../models/index.js";

const getCategoriesByProduct = async (productId) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };

    const categories = await product.getCategory();
    return { EM: "Get categories by product success", EC: 0, DT: categories };
  } catch (error) {
    console.error(">>> Error getCategoriesByProduct:", error);
    return { EM: "Error from service (getCategoriesByProduct)", EC: -1, DT: "" };
  }
};

const getProductsByCategory = async (categoryId) => {
  try {
    const category = await db.Category.findByPk(categoryId);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };

    const products = await category.getProduct();
    return { EM: "Get products by category success", EC: 0, DT: products };
  } catch (error) {
    console.error(">>> Error getProductsByCategory:", error);
    return { EM: "Error from service (getProductsByCategory)", EC: -1, DT: "" };
  }
};

const addProductCategory = async (productId, categoryId) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };

    const category = await db.Category.findByPk(categoryId);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };

    // Use Sequelize generated accessor
    await product.addCategory(category);
    return { EM: "Add product-category success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error addProductCategory:", error);
    return { EM: "Error from service (addProductCategory)", EC: -1, DT: "" };
  }
};

const removeProductCategory = async (productId, categoryId) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { EM: "Product not found", EC: 1, DT: "" };

    const category = await db.Category.findByPk(categoryId);
    if (!category) return { EM: "Category not found", EC: 1, DT: "" };

    await product.removeCategory(category);
    return { EM: "Remove product-category success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error removeProductCategory:", error);
    return { EM: "Error from service (removeProductCategory)", EC: -1, DT: "" };
  }
};

export default {
  getCategoriesByProduct,
  getProductsByCategory,
  addProductCategory,
  removeProductCategory,
};

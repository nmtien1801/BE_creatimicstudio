import db from "../models/index.js";

const createProductImage = async (data) => {
  try {
    const { productId, image, color } = data;
    if (!productId || !image) {
      return { EM: "Missing required fields: productId, image", EC: 1, DT: "" };
    }
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return { EM: "Product not found", EC: 1, DT: "" };
    }
    const newImage = await db.ProductImage.create({ productId, image, color });
    return { EM: "Create product image success", EC: 0, DT: newImage };
  } catch (error) {
    console.error(">>> Error createProductImage:", error);
    return { EM: "Error from service (createProductImage)", EC: -1, DT: "" };
  }
};

const getProductImagesByProductId = async (productId) => {
  try {
    const images = await db.ProductImage.findAll({
      where: { productId },
      order: [["createdAt", "ASC"]],
    });
    return { EM: "Get product images success", EC: 0, DT: images };
  } catch (error) {
    console.error(">>> Error getProductImagesByProductId:", error);
    return { EM: "Error from service (getProductImagesByProductId)", EC: -1, DT: "" };
  }
};

const updateProductImage = async (id, data) => {
  try {
    const { color } = data;
    
    const imageRecord = await db.ProductImage.findByPk(id);
    if (!imageRecord) {
      return { EM: "Product image not found", EC: 1, DT: "" };
    }
    await imageRecord.update({ color });
    return { EM: "Update product image success", EC: 0, DT: imageRecord };
  } catch (error) {
    console.error(">>> Error updateProductImage:", error);
    return { EM: "Error from service (updateProductImage)", EC: -1, DT: "" };
  }
};

const deleteProductImage = async (id) => {
  try {
    const imageRecord = await db.ProductImage.findByPk(id);
    if (!imageRecord) {
      return { EM: "Product image not found", EC: 1, DT: "" };
    }
    await imageRecord.destroy();
    return { EM: "Delete product image success", EC: 0, DT: "" };
  } catch (error) {
    console.error(">>> Error deleteProductImage:", error);
    return { EM: "Error from service (deleteProductImage)", EC: -1, DT: "" };
  }
};

export default {
  createProductImage,
  getProductImagesByProductId,
  updateProductImage,
  deleteProductImage,
};
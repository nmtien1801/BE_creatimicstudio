import productImageService from "../service/productImageService.js";

const createProductImage = async (req, res) => {
  try {
    const data = await productImageService.createProductImage(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error createProductImage:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getProductImagesByProductId = async (req, res) => {
  try {
    const productId = req.params.productId;
    const data = await productImageService.getProductImagesByProductId(productId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getProductImagesByProductId:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateProductImage = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productImageService.updateProductImage(id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updateProductImage:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productImageService.deleteProductImage(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error deleteProductImage:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

export default {
  createProductImage,
  getProductImagesByProductId,
  updateProductImage,
  deleteProductImage,
};
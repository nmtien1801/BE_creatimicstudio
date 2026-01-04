import productCategoryService from "../service/productCategoryService.js";

const getCategoriesByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const data = await productCategoryService.getCategoriesByProduct(productId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getCategoriesByProduct:", error);
    return res.status(500).json({ EM: "Error getCategoriesByProduct from server", EC: -1, DT: "" });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const data = await productCategoryService.getProductsByCategory(categoryId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getProductsByCategory:", error);
    return res.status(500).json({ EM: "Error getProductsByCategory from server", EC: -1, DT: "" });
  }
};

const addProductCategory = async (req, res) => {
  try {
    const { productId, categoryId } = req.body;
    const data = await productCategoryService.addProductCategory(productId, categoryId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error addProductCategory:", error);
    return res.status(500).json({ EM: "Error addProductCategory from server", EC: -1, DT: "" });
  }
};

const removeProductCategory = async (req, res) => {
  try {
    const { productId, categoryId } = req.body;
    const data = await productCategoryService.removeProductCategory(productId, categoryId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error removeProductCategory:", error);
    return res.status(500).json({ EM: "Error removeProductCategory from server", EC: -1, DT: "" });
  }
};

export default {
  getCategoriesByProduct,
  getProductsByCategory,
  addProductCategory,
  removeProductCategory,
};

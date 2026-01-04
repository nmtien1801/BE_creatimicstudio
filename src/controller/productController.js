import productService from "../service/productService.js";

const getListProduct = async (req, res) => {
  try {
    const data = await productService.getListProduct(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListProduct:", error);
    return res
      .status(500)
      .json({ EM: "Error getListProduct from server", EC: -1, DT: "" });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productService.getProductById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getProductById:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = await productService.createProduct(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error createProduct:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productService.updateProduct(id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updateProduct:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productService.deleteProduct(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error deleteProduct:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getListProductDropdown = async (req, res) => {
  try {
    const data = await productService.getListProductDropdown();
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListProductDropdown:", error);
    return res
      .status(500)
      .json({ EM: "Error getListProductDropdown from server", EC: -1, DT: "" });
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

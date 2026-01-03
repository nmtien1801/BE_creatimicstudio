import categoryService from "../service/categoryService.js";

const getListCategory = async (req, res) => {
  try {
    const data = await categoryService.getListCategory(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListCategory:", error);
    return res.status(500).json({ EM: "Error getListCategory from server", EC: -1, DT: "" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await categoryService.getCategoryById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getCategoryById:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const createCategory = async (req, res) => {
  try {
    const data = await categoryService.createCategory(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error createCategory:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await categoryService.updateCategory(id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updateCategory:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await categoryService.deleteCategory(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error deleteCategory:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

export default {
  getListCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

import postService from "../service/postService.js";

const getListPost = async (req, res) => {
  try {
    const data = await postService.getListPost(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListPost:", error);
    return res
      .status(500)
      .json({ EM: "Error getListPost from server", EC: -1, DT: "" });
  }
};

const getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await postService.getPostById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getPostById:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const createPost = async (req, res) => {
  try {
    let userName = req.headers["username"];

    const data = await postService.createPost(userName, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error createPost:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updatePost = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await postService.updatePost(id, userName, req.body);
    let userName = req.headers["username"];

    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updatePost:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await postService.deletePost(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error deletePost:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getListPostDropdown = async (req, res) => {
  try {
    const data = await postService.getListPostDropdown();
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListPostDropdown:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

export default {
  getListPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getListPostDropdown,
};

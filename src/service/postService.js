import db from "../models/index.js";
import { Op } from "sequelize";

const getListPost = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.title) where.title = { [Op.like]: `%${query.title}%` };

    const posts = await db.Post.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // 🔹 Lấy tổng ALL (không limit)
    const total = await db.Post.count({ where });

    return {
      EM: "Get post list success",
      EC: 0,
      DT: { posts, total, page, limit },
    };
  } catch (error) {
    console.error(">>> Error getListPost:", error);
    return { EM: "Error from service (getListPost)", EC: -1, DT: "" };
  }
};

const getPostById = async (id) => {
  try {
    if (!id) {
      return {
        EM: "Missing required id",
        EC: -1,
        DT: "",
      };
    }
    const post = await db.Post.findByPk(id);
    if (post) {
      return {
        EM: "Get post success",
        EC: 0,
        DT: post,
      };
    } else {
      return {
        EM: "Post not found",
        EC: -1,
        DT: "",
      };
    }
  } catch (error) {
    console.error(">>> Error getPostById:", error);
    return { EM: "Error from service (getPostById)", EC: -1, DT: "" };
  }
};

const createPost = async (userName, data) => {
  try {
    if (!data.title) {
      return {
        EM: "Missing required title",
        EC: -1,
        DT: "",
      };
    }
    const newPost = await db.Post.create({
      ...data,
      userCreate: userName,
      userUpdate: userName,
    });

    return {
      EM: "Thêm mới bài viết thành công",
      EC: 0,
      DT: newPost,
    };
  } catch (error) {
    console.error(">>> Error createPost:", error);
    return { EM: "Error from service (createPost)", EC: -1, DT: "" };
  }
};

const updatePost = async (id, userName, data) => {
  try {
    if (!id) {
      return {
        EM: "Missing required id",
        EC: -1,
        DT: "",
      };
    }
    const post = await db.Post.findByPk(id);
    if (post) {
      await post.update({
        ...data,
        userUpdate: userName,
      });

      return {
        EM: "Cập nhật bài viết thành công",
        EC: 0,
        DT: post,
      };
    } else {
      return {
        EM: "Không tìm thấy bài viết",
        EC: -1,
        DT: "",
      };
    }
  } catch (error) {
    console.error(">>> Error updatePost:", error);
    return { EM: "Error from service (updatePost)", EC: -1, DT: "" };
  }
};

const deletePost = async (id) => {
  try {
    if (!id) {
      return {
        EM: "Missing required id",
        EC: -1,
        DT: "",
      };
    }
    const post = await db.Post.findByPk(id);
    if (post) {
      await post.destroy();
      return {
        EM: "Delete post success",
        EC: 0,
        DT: "",
      };
    } else {
      return {
        EM: "Post not found",
        EC: -1,
        DT: "",
      };
    }
  } catch (error) {
    console.error(">>> Error deletePost:", error);
    return { EM: "Error from service (deletePost)", EC: -1, DT: "" };
  }
};

const getListPostDropdown = async () => {
  try {
    const posts = await db.Post.findAll({
      attributes: ["id", "title"],
      where: { status: true },
      order: [["title", "ASC"]],
    });
    return {
      EM: "Get post dropdown success",
      EC: 0,
      DT: posts,
    };
  } catch (error) {
    console.error(">>> Error getListPostDropdown:", error);
    return { EM: "Error from service (getListPostDropdown)", EC: -1, DT: "" };
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

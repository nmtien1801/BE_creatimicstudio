import db from "../models/index.js";
import { Op } from "sequelize";

const getListRecruitment = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.title) where.title = { [Op.like]: `%${query.title}%` };

    const recruitments = await db.Recruitment.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // 🔹 Lấy tổng ALL (không limit)
    const total = await db.Recruitment.count({ where });

    return {
      EM: "Get recruitment list success",
      EC: 0,
      DT: { recruitments, total, page, limit },
    };
  } catch (error) {
    console.error(">>> Error getListRecruitment:", error);
    return { EM: "Error from service (getListRecruitment)", EC: -1, DT: "" };
  }
};

const getRecruitmentById = async (id) => {
  try {
    if (!id) {
      return {
        EM: "Missing required id",
        EC: -1,
        DT: "",
      };
    }
    const recruitment = await db.Recruitment.findByPk(id);
    if (recruitment) {
      return {
        EM: "Get recruitment success",
        EC: 0,
        DT: recruitment,
      };
    } else {
      return {
        EM: "Recruitment not found",
        EC: -1,
        DT: "",
      };
    }
  } catch (error) {
    console.error(">>> Error getRecruitmentById:", error);
    return { EM: "Error from service (getRecruitmentById)", EC: -1, DT: "" };
  }
};

const createRecruitment = async (userName, data) => {
  try {
    if (!data.title) {
      return {
        EM: "Missing required title",
        EC: -1,
        DT: "",
      };
    }
    const newRecruitment = await db.Recruitment.create({
      ...data,
      userCreate: decodeURIComponent(userName),
      userUpdate: decodeURIComponent(userName),
    });

    return {
      EM: "Thêm mới tuyển dụng thành công",
      EC: 0,
      DT: newRecruitment,
    };
  } catch (error) {
    console.error(">>> Error createRecruitment:", error);
    return { EM: "Error from service (createRecruitment)", EC: -1, DT: "" };
  }
};

const updateRecruitment = async (id, userName, data) => {
  try {
    if (!id) {
      return {
        EM: "Missing required id",
        EC: -1,
        DT: "",
      };
    }
    const recruitment = await db.Recruitment.findByPk(id);
    if (recruitment) {
      await recruitment.update({
        ...data,
        userUpdate: decodeURIComponent(userName),
      });

      return {
        EM: "Cập nhật tuyển dụng thành công",
        EC: 0,
        DT: recruitment,
      };
    } else {
      return {
        EM: "Không tìm thấy tuyển dụng",
        EC: -1,
        DT: "",
      };
    }
  } catch (error) {
    console.error(">>> Error updateRecruitment:", error);
    return { EM: "Error from service (updateRecruitment)", EC: -1, DT: "" };
  }
};

const deleteRecruitment = async (id) => {
  try {
    if (!id) {
      return {
        EM: "Missing required id",
        EC: -1,
        DT: "",
      };
    }
    const recruitment = await db.Recruitment.findByPk(id);
    if (recruitment) {
      await recruitment.destroy();
      return {
        EM: "Delete recruitment success",
        EC: 0,
        DT: "",
      };
    } else {
      return {
        EM: "Recruitment not found",
        EC: -1,
        DT: "",
      };
    }
  } catch (error) {
    console.error(">>> Error deleteRecruitment:", error);
    return { EM: "Error from service (deleteRecruitment)", EC: -1, DT: "" };
  }
};

const getListRecruitmentDropdown = async () => {
  try {
    const recruitments = await db.Recruitment.findAll({
      attributes: ["id", "title"],
      where: { status: true },
      order: [["title", "ASC"]],
    });
    return {
      EM: "Get recruitment dropdown success",
      EC: 0,
      DT: recruitments,
    };
  } catch (error) {
    console.error(">>> Error getListRecruitmentDropdown:", error);
    return { EM: "Error from service (getListRecruitmentDropdown)", EC: -1, DT: "" };
  }
};

export default {
  getListRecruitment,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
  getListRecruitmentDropdown,
};

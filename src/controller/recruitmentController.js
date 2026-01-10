import recruitmentService from "../service/recruitmentService.js";

const getListRecruitment = async (req, res) => {
  try {
    const data = await recruitmentService.getListRecruitment(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListRecruitment:", error);
    return res
      .status(500)
      .json({ EM: "Error getListRecruitment from server", EC: -1, DT: "" });
  }
};

const getRecruitmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await recruitmentService.getRecruitmentById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getRecruitmentById:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const createRecruitment = async (req, res) => {
  try {
    let userName = req.headers["username"];

    const data = await recruitmentService.createRecruitment(userName, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error createRecruitment:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateRecruitment = async (req, res) => {
  try {
    const id = req.params.id;
    let userName = req.headers["username"];
    const data = await recruitmentService.updateRecruitment(id, userName, req.body);

    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updateRecruitment:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteRecruitment = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await recruitmentService.deleteRecruitment(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error deleteRecruitment:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const getListRecruitmentDropdown = async (req, res) => {
  try {
    const data = await recruitmentService.getListRecruitmentDropdown();
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error getListRecruitmentDropdown:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
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

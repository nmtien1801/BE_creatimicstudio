import staffService from "../service/staffService.js";

const getListStaff = async (req, res) => {
  try {
    const data = await staffService.getListStaff();
    return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
  } catch (error) {
    return res.status(500).json({ EM: "Error getListStaff from server", EC: -1, DT: "" });
  }
};

const createStaff = async (req, res) => {
  try {
    const data = await staffService.createStaff(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error createStaff:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const updateStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await staffService.updateStaff(id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error updateStaff:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await staffService.deleteStaff(id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> Error deleteStaff:", error);
    return res.status(500).json({ EM: "Error from server", EC: -1, DT: "" });
  }
};

export default {
  getListStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};

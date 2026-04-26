import userCutVideoService from "../service/userCutVideoService.js";

const handleLogin = async (req, res) => {
  try {
    let data = await userCutVideoService.handleLogin(req.body);

    if (data.EC !== 0) {
      return res.status(200).json({
        EM: data.EM,
        EC: data.EC,
        DT: data.DT,
      });
    }

    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in handleLogin:", error);
    return res.status(500).json({
      EM: "Error from server login",
      EC: -1,
      DT: "",
    });
  }
};

const getList = async (req, res) => {
  try {
    let data = await userCutVideoService.getList();
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in getList:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

const createUser = async (req, res) => {
  try {
    let data = await userCutVideoService.createUser(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let data = await userCutVideoService.updateUser(userId, req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let data = await userCutVideoService.deleteUser(userId);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: "",
    });
  }
};

export default {
  handleLogin,
  getList,
  createUser,
  updateUser,
  deleteUser,
};

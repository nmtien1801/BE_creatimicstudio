const orderService = require("../service/orderService");

const handleCreateOrder = async (req, res) => {
  try {
    // userId có thể lấy từ middleware xác thực jwt (req.user?.id) hoặc req.body
    const userId = req.user?.id || req.body.userId || null;
    const response = await orderService.createOrderService(req.body, userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("handleCreateOrder error:", error);
    return res.status(500).json({
      EM: "Lỗi Server Controller",
      EC: -1,
      DT: null,
    });
  }
};

const handleGetOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({
        EM: "Thiếu mã orderId!",
        EC: 1,
        DT: null,
      });
    }

    const response = await orderService.getOrderDetailService(orderId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("handleGetOrderDetail error:", error);
    return res.status(500).json({
      EM: "Lỗi Server Controller",
      EC: -1,
      DT: null,
    });
  }
};

const handleGetOrderHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || null;
    const response = await orderService.getOrderHistoryService(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("handleGetOrderHistory error:", error);
    return res.status(500).json({
      EM: "Lỗi Server Controller",
      EC: -1,
      DT: null,
    });
  }
};

const handleGetAllOrders = async (req, res) => {
  try {
    const response = await orderService.getAllOrdersService();
    return res.status(200).json(response);
  } catch (error) {
    console.error("handleGetAllOrders error:", error);
    return res.status(500).json({
      EM: "Lỗi Server Controller",
      EC: -1,
      DT: null,
    });
  }
};

const handleUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const response = await orderService.updateOrderStatusService(orderId, status);

    if (response.EC === 1) {
      return res.status(400).json(response);
    }
    if (response.EC === 2) {
      return res.status(404).json(response);
    }
    if (response.EC !== 0) {
      return res.status(500).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("handleUpdateOrderStatus error:", error);
    return res.status(500).json({
      EM: "Lỗi Server Controller",
      EC: -1,
      DT: null,
    });
  }
};

module.exports = {
  handleCreateOrder,
  handleGetOrderDetail,
  handleGetOrderHistory,
  handleGetAllOrders,
  handleUpdateOrderStatus,
};

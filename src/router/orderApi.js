const express = require("express");
const router = express.Router();
import { checkUserJwt } from "../middleware/jwtAction";
import orderController from "../controller/orderController";

const ApiOrder = (app) => {
  // middleware
  router.use(checkUserJwt);
  const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        EM: "Bạn không có quyền thực hiện thao tác này!",
        EC: -1,
        DT: null,
      });
    }
    return next();
  };

  router.post("/order/create", orderController.handleCreateOrder);
  router.get("/order/detail/:orderId", orderController.handleGetOrderDetail);
  router.get("/order/history", orderController.handleGetOrderHistory);
  router.get("/order/manager", requireAdmin, orderController.handleGetAllOrders);
  router.patch(
    "/order/:orderId/status",
    requireAdmin,
    orderController.handleUpdateOrderStatus,
  );

  return app.use("/api", router);
};

export default ApiOrder;

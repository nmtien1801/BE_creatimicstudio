const express = require("express");
const router = express.Router();
import { checkUserJwt } from "../middleware/jwtAction";
import orderController from "../controller/orderController";

const ApiOrder = (app) => {
  // middleware
  router.use(checkUserJwt);
  router.post("/order/create", orderController.handleCreateOrder);
  router.get("/order/detail/:orderId", orderController.handleGetOrderDetail);
  router.get("/order/history", orderController.handleGetOrderHistory);

  return app.use("/api", router);
};

export default ApiOrder;

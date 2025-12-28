import express from "express";
import authController from "../controller/authController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiStaff = (app) => {
  // middleware
  router.use(checkUserJwt);
  
  router.get("/staff/list", authController.getListStaff);
  router.post("/staff/create", authController.createStaff);
  router.put("/staff/update/:id", authController.updateStaff);
  router.delete("/staff/delete/:id", authController.deleteStaff);

  return app.use("/api", router);
};

export default ApiStaff;

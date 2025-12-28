import express from "express";
import staffController from "../controller/staffController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiStaff = (app) => {
  // middleware
  router.use(checkUserJwt);
  
  router.get("/staff/list", staffController.getListStaff);
  router.post("/staff/create", staffController.createStaff);
  router.put("/staff/update/:id", staffController.updateStaff);
  router.delete("/staff/delete/:id", staffController.deleteStaff);

  return app.use("/api", router);
};

export default ApiStaff;

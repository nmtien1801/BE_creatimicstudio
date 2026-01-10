import express from "express";
import recruitmentController from "../controller/recruitmentController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiRecruitment = (app) => {
  // middleware
  router.use(checkUserJwt);

  router.get("/recruitment/list", recruitmentController.getListRecruitment); // GET /api/recruitment/list?page=1&limit=10
  router.get("/recruitment/byRecruitmentId/:id", recruitmentController.getRecruitmentById);
  router.post("/recruitment/create", recruitmentController.createRecruitment);
  router.put("/recruitment/update/:id", recruitmentController.updateRecruitment);
  router.delete("/recruitment/delete/:id", recruitmentController.deleteRecruitment);
  router.get("/recruitment/dropdown", recruitmentController.getListRecruitmentDropdown);

  return app.use("/api", router);
};

export default ApiRecruitment;

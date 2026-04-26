import express from "express";
import userCutVideoController from "../controller/userCutVideoController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const UserCutVideoRoutes = (app) => {
  // Public endpoint - không cần middleware
  router.post("/user-cut-video/login", userCutVideoController.handleLogin);

  // Áp dụng middleware cho các endpoint khác
  router.use(checkUserJwt);

  // Protected endpoints - cần JWT
  router.get("/user-cut-video/list", userCutVideoController.getList);
  router.post("/user-cut-video/create", userCutVideoController.createUser);
  router.put("/user-cut-video/update/:id", userCutVideoController.updateUser);
  router.delete(
    "/user-cut-video/delete/:id",
    userCutVideoController.deleteUser,
  );

  return app.use("/api", router);
};

export default UserCutVideoRoutes;

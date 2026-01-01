import express from "express";
import authController from "../controller/authController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const AuthRoutes = (app) => {
  // middleware
  router.use(checkUserJwt);

  //rest api - dùng web sử dụng các method (CRUD)
  //GET(R), POST (C), PUT (U), DELETE (D)
  router.post("/auth/login", authController.handleLogin);
  router.post("/auth/register", authController.handleRegister);
  router.post("/auth/refreshToken", authController.handleRefreshToken);
  router.get("/auth/account", authController.fetchAccount);

  router.post("/auth/change-password", authController.changePassword);
  router.put("/auth/update-profile", authController.updateProfile);

  return app.use("/api", router);
};

export default AuthRoutes;

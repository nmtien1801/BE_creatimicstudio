import express from "express";
import categoryController from "../controller/categoryController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiCategory = (app) => {
  // middleware
  router.use(checkUserJwt);

  router.get("/category/list", categoryController.getListCategory); // GET /api/category/list?page=1&limit=10
  router.get("/category/:id", categoryController.getCategoryById);
  router.post("/category/create", categoryController.createCategory);
  router.put("/category/update/:id", categoryController.updateCategory);
  router.delete("/category/delete/:id", categoryController.deleteCategory);

  return app.use("/api", router);
};

export default ApiCategory;

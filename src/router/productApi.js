import express from "express";
import productController from "../controller/productController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiProduct = (app) => {
  // middleware
  router.use(checkUserJwt);

  router.get("/product/list", productController.getListProduct); // GET /api/product/list?page=1&limit=10
  router.get("/product/:id", productController.getProductById);
  router.post("/product/create", productController.createProduct);
  router.put("/product/update/:id", productController.updateProduct);
  router.delete("/product/delete/:id", productController.deleteProduct);

  return app.use("/api", router);
};

export default ApiProduct;

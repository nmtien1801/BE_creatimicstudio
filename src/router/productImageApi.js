import express from "express";
import productImageController from "../controller/productImageController.js";
import { checkUserJwt } from "../middleware/jwtAction.js";

const router = express.Router();

const ApiProductImage = (app) => {
  // middleware
  router.use(checkUserJwt);

  router.post("/product-image/create", productImageController.createProductImage);
  router.get("/product-image/byProductId/:productId", productImageController.getProductImagesByProductId);
  router.put("/product-image/update/:id", productImageController.updateProductImage);
  router.delete("/product-image/delete/:id", productImageController.deleteProductImage);

  return app.use("/api", router);
};

export default ApiProductImage;
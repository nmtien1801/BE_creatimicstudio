import express from "express";
import productCategoryController from "../controller/productCategoryController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiProductCategory = (app) => {
  router.use(checkUserJwt);

  router.get(
    "/product-category/byProduct/:productId",
    productCategoryController.getCategoriesByProduct
  );

  router.get(
    "/product-category/byCategory/:categoryId",
    productCategoryController.getProductsByCategory
  );

  router.post(
    "/product-category/add",
    productCategoryController.addProductCategory
  );

  router.post(
    "/product-category/remove",
    productCategoryController.removeProductCategory
  );

  return app.use("/api", router);
};

export default ApiProductCategory;

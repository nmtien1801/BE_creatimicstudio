import express from "express";
import productController from "../controller/productController";
import reviewController from "../controller/reviewController.js";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiProduct = (app) => {
  router.get(
    "/product/:productId/reviews",
    reviewController.getProductReviews,
  );

  // middleware
  router.use(checkUserJwt);

  router.get(
    "/product/:productId/review-eligibility",
    reviewController.getReviewEligibility,
  );
  router.post(
    "/product/:productId/reviews",
    reviewController.createOrUpdateReview,
  );
  router.get("/product/list", productController.getListProduct); // GET /api/product/list?page=1&limit=10
  router.get("/product/filter", productController.getFilteredProducts); // GET /api/product/filter?page=1&limit=10&categoryId=1&priceProduct=100
  router.get("/product/byProductId/:id", productController.getProductById);
  router.post("/product/create", productController.createProduct);
  router.put("/product/update/:id", productController.updateProduct);
  router.delete("/product/delete/:id", productController.deleteProduct);
  router.get("/product/dropdown", productController.getListProductDropdown);

  return app.use("/api", router);
};

export default ApiProduct;

import express from "express";
import cartController from "../controller/cartController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const CartRoutes = (app) => {
  router.use(checkUserJwt);
  router.get("/cart", cartController.getCart);
  router.post("/cart", cartController.addToCart);
  router.patch("/cart/:id", cartController.updateCartItem);
  router.delete("/cart/:id", cartController.removeFromCart);
  return app.use("/api", router);
};

export default CartRoutes;

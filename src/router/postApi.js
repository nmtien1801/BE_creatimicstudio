import express from "express";
import postController from "../controller/postController";
import { checkUserJwt } from "../middleware/jwtAction";

const router = express.Router();

const ApiPost = (app) => {
  // middleware
  router.use(checkUserJwt);

  router.get("/post/list", postController.getListPost); // GET /api/post/list?page=1&limit=10
  router.get("/post/byPostId/:id", postController.getPostById);
  router.post("/post/create", postController.createPost);
  router.put("/post/update/:id", postController.updatePost);
  router.delete("/post/delete/:id", postController.deletePost);
  router.get("/post/dropdown", postController.getListPostDropdown);

  return app.use("/api", router);
};

export default ApiPost;

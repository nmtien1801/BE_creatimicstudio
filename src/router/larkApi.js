import express from "express";
import larkController from "../controller/larkController.js";

const router = express.Router();

const ApiPost = (app) => {
  router.post("/lark/notify", larkController.handleSendNotify);
  router.get("/lark/chats", larkController.handleGetChats); // xong thì xóa/khóa route này

  return app.use("/api", router);
};

export default ApiPost;

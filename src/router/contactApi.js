import express from "express";
import contactController from "../controller/contactController.js";

const router = express.Router();

const ContactRoutes = (app) => {
  router.post("/contact/send", contactController.handleSendContact);

  return app.use("/api", router);
};

export default ContactRoutes;
import express from "express";
import multer from "multer";
import contactController from "../controller/contactController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const ContactRoutes = (app) => {
  router.post("/contact/send", contactController.handleSendContact);
  router.post(
    "/contact/apply",
    upload.single("message"),
    contactController.handleApplyContact
  );

  return app.use("/api", router);
};

export default ContactRoutes;
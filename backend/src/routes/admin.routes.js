import express from "express";
import {
  createAdmin,
  createCharacterStock,
  adminLogin,
  deleteCharacterStockTemp,
  deleteAdmin,
  adminLogout,
} from "../controllers/admin.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middlewares.js";

const adminRouter = express.Router();

adminRouter.route("/auth/login").post(adminLogin);

//protected routes
adminRouter.use(verifyAdminJWT);

adminRouter.route("/auth/logout").post(adminLogout);
adminRouter
  .route("/admins")
  .post(createAdmin)
  .delete(deleteAdmin);
adminRouter
  .route("/character-stocks")
  .post(upload.single("imageURL"), createCharacterStock)
  .delete(deleteCharacterStockTemp);

export default adminRouter;

import express from "express";
import {
  addAdmin,
  addCharacterStock,
  adminLogin,
  removeCharacterStock,
  removeAdmin,
  adminLogout,
} from "../controllers/admin.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const adminRouter = express.Router();

adminRouter.route("/login").post(adminLogin);

//protected routes
adminRouter.use(verifyAdminJWT);

adminRouter.route("/logout").post(adminLogout);
adminRouter.route("/add-admin").post(addAdmin);
adminRouter.route("/remove-admin").post(removeAdmin);
adminRouter.route("/add-character-stock").post(addCharacterStock);
adminRouter.route("/remove-character-stock").post(removeCharacterStock);

export default adminRouter;

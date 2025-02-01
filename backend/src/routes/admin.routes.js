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
import upload from "../middlewares/multer.middlewares.js";
import { getAllStocks } from "../controllers/stock.controllers.js";

const adminRouter = express.Router();

adminRouter.route("/login").post(adminLogin);

//protected routes
adminRouter.use(verifyAdminJWT);

adminRouter.route("/logout").post(adminLogout);
adminRouter.route("/add-admin").post(addAdmin);
adminRouter.route("/remove-admin").post(removeAdmin);
adminRouter.route("/add-character-stock").post(upload.single("imageURL"), addCharacterStock);
adminRouter.route("/remove-character-stock").post(removeCharacterStock);
adminRouter.route("/all-stocks").get(getAllStocks);

export default adminRouter;

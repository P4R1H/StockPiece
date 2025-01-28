import express from "express";
import {
  addAdmin,
  addCharacterStock,
  adminLogin,
  deleteCharacterStock,
  removeAdmin
} from "../controllers/admin.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const adminRouter = express.Router();

adminRouter
  .route("/login")
  .post(adminLogin);

//protected routes
adminRouter.use(verifyAdminJWT);

adminRouter
  .route("/add-admin")
  .post(addAdmin);
adminRouter
  .route('/remove-admin')
  .post(removeAdmin)
adminRouter
  .route('/add-character-stock')
  .post(addCharacterStock)
adminRouter
  .route("/delete-character-stock")
  .post(deleteCharacterStock)

export default adminRouter;

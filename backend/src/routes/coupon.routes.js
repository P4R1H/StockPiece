import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/coupon.controllers.js";
import { verifyAdminJWT } from "../middlewares/auth.middlewares.js";

const couponRouter = express.Router();

// Admin routes
couponRouter.use(verifyAdminJWT);
couponRouter
  .route("/coupons")
  .get(getAllCoupons)
  .post(createCoupon)
  .delete(deleteCoupon);

export default couponRouter;

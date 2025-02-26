import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/coupon.controllers.js";
import { verifyAdminJWT, verifyJWT } from "../middlewares/auth.middlewares.js";
import { generateReferralCoupon } from "../controllers/coupon.controllers.js";

const couponRouter = express.Router();

couponRouter.post("/coupons/referral", verifyJWT, generateReferralCoupon);

// Admin routes
couponRouter.use(verifyAdminJWT);
couponRouter
  .route("/coupons")
  .get(getAllCoupons)
  .post(createCoupon)
  .delete(deleteCoupon);

export default couponRouter;

import asyncHandler from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import Coupon from "../models/coupon.models.js";
import { MAX_REFERRALS, REFERRAL_BONUS, REFERRER_BONUS } from "../constants.js";

const createCoupon = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(400, "Unauthorized request");
  }

  //we also need to check if it is an super admin
  if (!req.admin.isSuperAdmin) {
    throw new ApiError(403, "only super admin access");
  }

  const { code, amount, maxUsers, isFirstTimeOnly } = req.body;

  if (!code?.trim() || !amount || !maxUsers) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if code matches pattern (3-15 letters + 3-10 numbers)
  const codePattern = /^[A-Z]{3,15}\d{3,10}$/;
  if (!codePattern.test(code)) {
    throw new ApiError(400, "Invalid coupon code format");
  }

  // Check max coupons limit
  const activeCoupons = await Coupon.countDocuments({ isActive: true });
  if (activeCoupons >= 10) {
    throw new ApiError(400, "Maximum active coupons limit reached");
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    amount,
    maxUsers,
    isFirstTimeOnly: isFirstTimeOnly || false,
  });

  res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const getAllCoupons = asyncHandler(async (req, res, _next) => {
  if (!req.admin) {
    throw new ApiError(400, "Unauthorized request");
  }

  const all = req.query.all;

  const coupons =
    all === "true"
      ? await Coupon.find()
      : await Coupon.find({ isActive: true });

  if (!coupons) {
    throw new ApiError(500, "error in accessing all the coupons");
  }

  res
    .status(200)
    .json(new ApiResponse(200, coupons, "coupons fetched successfully"));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(400, "Unauthorized request");
  }

  const { code } = req.body;

  const coupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { isActive: false },
    { new: true }
  );

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon deleted successfully"));
});

const generateReferralCoupon = asyncHandler(async (req, res) => {
  const user = req.user;

  // Check if user already has an active referral coupon
  const existingCoupon = await Coupon.findOne({
    createdBy: user._id,
    couponType: "REFERRAL",
    isActive: true,
  });

  if (existingCoupon) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingCoupon,
          "Existing referral coupon retrieved"
        )
      );
  }

  // Generate unique referral code (user's username + random numbers)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const referralCode = `${user.username.toUpperCase()}${randomNum}`;

  // Create new referral coupon
  const coupon = await Coupon.create({
    code: referralCode,
    amount: REFERRAL_BONUS, // Fixed bonus for referred user
    referrerBonus: REFERRER_BONUS, // Fixed bonus for referrer
    maxUsers: MAX_REFERRALS, // Limit number of referrals
    isFirstTimeOnly: true, // Only for new users
    couponType: "REFERRAL",
    createdBy: user._id,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, coupon, "Referral coupon generated successfully")
    );
});

export { createCoupon, deleteCoupon, getAllCoupons, generateReferralCoupon };

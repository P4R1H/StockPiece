import asyncHandler from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import Coupon from "../models/coupon.models.js";

const createCoupon = asyncHandler(async (req, res) => {
  if (!req.admin) {
    throw new ApiError(400, "Unauthorized request");
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

export { createCoupon, deleteCoupon, getAllCoupons };

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      max: 10000,
    },
    referrerBonus: {
      type: Number,
      default: 0, // Amount the referrer gets
    },
    maxUsers: {
      type: Number,
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isFirstTimeOnly: {
      type: Boolean,
      default: false,
    },
    couponType: {
      type: String,
      enum: ["ADMIN", "REFERRAL"],
      default: "ADMIN",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;

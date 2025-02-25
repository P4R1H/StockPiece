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

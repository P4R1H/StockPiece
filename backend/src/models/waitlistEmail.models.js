import mongoose from "mongoose";
import connectWaitlistDB from "../db/waitlistDb.js";

const waitlistEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model using the waitlist database connection
const getWaitlistEmailModel = async () => {
  const waitlistConnection = await connectWaitlistDB();
  return waitlistConnection.model("WaitlistEmail", waitlistEmailSchema);
};

export default getWaitlistEmailModel;

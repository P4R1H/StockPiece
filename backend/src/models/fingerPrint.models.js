import mongoose from "mongoose";

const userFingerprintSchema = new mongoose.Schema({
  fingerprint: {
    type: String,
    unique: true,
    required: [true,"finger print is required"],
    trim: true
  },
  count: {
    type: Number,
    default: 1,
    max: 3,
  },
  createdAt: {
    type: Date,
    expires: "7d",
    default: Date.now,
  },
});

const UserFingerprint = mongoose.model(
  "UserFingerprint",
  userFingerprintSchema
);

export default UserFingerprint;

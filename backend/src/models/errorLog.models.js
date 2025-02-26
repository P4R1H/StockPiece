import mongoose from "mongoose";

const errorSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    isInternalServerError: {
      type: Boolean,
      default: false,
    },
    isHighPriority: {
      type: Boolean,
      default: false,
    },
    rawError: {
      type: mongoose.Schema.Types.Mixed,
    },
    additionalInfo: {
      type: mongoose.Schema.Types.Mixed,
    }
  },
  {
    timestamps: true
  }
);

const ErrorLog = mongoose.model("ErrorLog", errorSchema);

export default ErrorLog;
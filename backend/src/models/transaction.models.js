import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stockID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CharacterStock",
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  value: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    enum: ["sell", "buy"],
    required: true,
  },
  chapterPurchasedAt: {
    type: Number,
    required: true,
    index: true
  },
});

// transactionSchema.plugin()

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

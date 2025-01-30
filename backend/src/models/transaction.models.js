import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CharacterStock',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  purchaseValue: {
    type: Number,
    default: 1
  },
  chapterPurchasedAt: {
    type: Number,
    required: true
  }
})

// transactionSchema.plugin()

const Transaction = mongoose.model('Transaction',transactionSchema);

export default Transaction;
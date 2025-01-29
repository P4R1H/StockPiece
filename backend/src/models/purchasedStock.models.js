import mongoose from 'mongoose'

const purchasedStockSchema = new mongoose.Schema({
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

// purchasedStockSchema.plugin()

const PurchasedStock = mongoose.model('PurchasedStock',purchasedStockSchema);

export default PurchasedStock;
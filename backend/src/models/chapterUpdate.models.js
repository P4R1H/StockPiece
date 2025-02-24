import mongoose from "mongoose";

const statisticsSchema = new mongoose.Schema({
  stockID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CharacterStock",
    required: true,
  },
  oldValue: {
    type: Number,
  },
  newValue: {
    type: Number,
    required: true,
  },
  totalBuys: {
    type: Number,
  },
  totalSells: {
    type: Number,
  },
  totalQuantity: {
    type: Number,
  },
});

const chapterUpdateSchema = new mongoose.Schema(
  {
    chapter: {
      type: Number,
      required: true,
    },
    updates: {
      type: [statisticsSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const ChapterUpdate = mongoose.model("ChapterUpdate", chapterUpdateSchema);

export default ChapterUpdate;

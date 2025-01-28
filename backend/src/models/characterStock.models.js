import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//we can think of adding recent Value history later
const characterStockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    initialValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

characterStockSchema.plugin(mongooseAggregatePaginate);

const CharacterStock = mongoose.model("CharacterStock", characterStockSchema);

export default CharacterStock;

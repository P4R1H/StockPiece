import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { defaultAvatarUrl } from "../constants.js";

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
    imageURL: {
      type: String, //cloudinary url
      default: defaultAvatarUrl,
    },
    currentValue: {
      type: Number,
      required: true,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

characterStockSchema.plugin(mongooseAggregatePaginate);

const CharacterStock = mongoose.model("CharacterStock", characterStockSchema);

export default CharacterStock;

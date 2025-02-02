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
    baseQuantity: {
      type: Number,
      default: 50,
    },
    valueHistory: {
      type: [
        {
          chapter: {
            type: Number,
            required: true,
          },
          value: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
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

import mongoose from "mongoose";

const chapterReleaseSchema = new mongoose.Schema({
  chapter: {
    type: Number,
    required: true,
    unique: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  windowEndDate: {
    type: Date,
    required: true,
  },
  isWindowClosed: {
    type: Boolean,
    default: false,
  },
  isPriceUpdated: {
    type: Boolean,
    default: false,
  },
});

const ChapterRelease = mongoose.model("ChapterRelease", chapterReleaseSchema);

export default ChapterRelease;

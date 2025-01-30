import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const valueHistorySchema = new mongoose.Schema({
  characterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CharacterStock",
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReleaseChapter'
  },
  value: {
    type: Number,
    required: true,
  },
});

valueHistorySchema.plugin(mongooseAggregatePaginate);

const ValueHistory = mongoose.model("ValueHistory", valueHistorySchema);

export default ValueHistory;

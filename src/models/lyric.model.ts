import { Schema, model, Types } from "mongoose";

const CommentSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  track: {
    type: Types.ObjectId,
    ref: "track",
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default model("lyric", CommentSchema);

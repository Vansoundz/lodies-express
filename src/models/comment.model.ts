import { Schema, model, Types } from "mongoose";

const CommentSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  track: {
    type: Types.ObjectId,
    ref: "track",
  },

  visible: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  replies: [
    {
      type: Types.ObjectId,
      ref: "comment",
    },
  ],
  user: { type: Types.ObjectId, ref: "user" },
});

export default model("comment", CommentSchema);

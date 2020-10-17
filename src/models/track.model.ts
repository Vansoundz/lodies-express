import { Schema, model, Types } from "mongoose";

const TrackSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  lyrics: {
    type: Types.ObjectId,
    ref: "lyric",
  },
  artist: {
    type: Types.ObjectId,
    ref: "user",
  },
  visible: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    enum: ["track", "beat", "mix", "podcast"],
    default: "track",
  },
  comments: [
    {
      type: Types.ObjectId,
      ref: "comment",
    },
  ],
  cover: {
    type: String,
  },
  coverKey: { type: String },
  sourceKey: { type: String },
  source: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      type: Types.ObjectId,
      ref: "user",
    },
  ],
  plays: [
    {
      userId: { type: Types.ObjectId, ref: "user" },
      deviceId: { type: String },
    },
  ],
});

export default model("track", TrackSchema);

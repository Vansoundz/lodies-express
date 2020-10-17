import { Schema, model, Types } from "mongoose";

const AlbumSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  user: {
    type: Types.ObjectId,
    ref: "user",
  },
  cover: {
    type: String,
  },
  tracks: [
    {
      type: Types.ObjectId,
      ref: "track",
    },
  ],
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
      user: { type: Types.ObjectId, ref: "user" },
      device: { type: String },
    },
  ],
});

export default model("playlist", AlbumSchema);

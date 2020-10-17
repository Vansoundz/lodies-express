import { Schema, model, Types } from "mongoose";

const AlbumSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: Types.ObjectId,
    ref: "user",
  },
  cover: {
    type: String,
  },
  coverKey: {
    type: String,
  },
  visible: {
    type: Boolean,
    default: true,
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

export default model("album", AlbumSchema);

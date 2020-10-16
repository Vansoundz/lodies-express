import { Schema, model, Types } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  accountType: {
    type: String,
    enum: ["artist", "fan"],
    default: "fan",
  },
  tracks: [
    {
      type: Types.ObjectId,
      ref: "track",
    },
  ],
  albums: [
    {
      type: Types.ObjectId,
      ref: "album",
    },
  ],
  playlists: [
    {
      type: Types.ObjectId,
      ref: "playlist",
    },
  ],
  image: {
    type: String,
  },
  imageKey: { type: String },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  social: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
  },
  phone: {
    type: String,
  },
  fans: [
    {
      type: Types.ObjectId,
      ref: "user",
    },
  ],
});

export default model("user", UserSchema);

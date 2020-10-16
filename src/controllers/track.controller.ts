import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import Track from "../models/track.model";
import User from "../models/user.model";

const createTrack = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty) {
    return res.status(400).json({ errors: result.array() });
  }

  // @ts-ignore
  let userId = req.userId;
  try {
    let user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: "User does not exist", param: "email" }] });
    }
    let track = new Track({ ...req.body });

    // @ts-ignore
    track.artist = userId;

    // @ts-ignore
    track.cover = req.files.cover[0].filename;

    // @ts-ignore
    track.source = req.files.track[0].filename;
    // @ts-ignore
    user.tracks = [...user.tracks, track.id];

    await user.save();
    await track.save();

    res.json({ track });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const getTracks = async (req: Request, res: Response) => {
  try {
    let tracks = await Track.find({});
    res.json({ tracks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const getTrack = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const track = await Track.findById(id);

    if (!track) {
      res.status(404).json({ errors: [{ msg: "Track not found" }] });
    }

    res.json({ track });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const likeTrack = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId: Types.ObjectId = req.userId;
  try {
    let id = req.params.id;
    let track = await Track.findById(id);

    if (!track) {
      res.status(404).json({ errors: [{ msg: "Track not found" }] });
    }

    // @ts-ignore
    if (!track?.likes.includes(userId)) {
      // @ts-ignore
      track.likes = [...track.likes, userId];
    } else {
      // @ts-ignore
      track.likes = track.likes.filter(
        (id: Types.ObjectId) => !id.equals(userId)
      );
    }

    await track?.save();

    res.json({ track });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const changeVisibility = async (req: Request, res: Response) => {
  // @ts-ignore
  let userId = req.userId;
  try {
    let id = req.params.id;

    let track = await Track.findById(id);

    if (!track) {
      return res.status(404).json({ errors: [{ msg: "Track not found" }] });
    }

    // @ts-ignore
    if (track.artist.toString() !== userId.toString()) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    // @ts-ignore
    track.visible = !track.visible;

    await track.save();

    res.json({ track });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

export { createTrack, getTracks, getTrack, likeTrack, changeVisibility };

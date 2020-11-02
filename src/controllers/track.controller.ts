import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import Track from "../models/track.model";
import Comment from "../models/comment.model";
import User from "../models/user.model";
import { S3 } from "aws-sdk";
import { config } from "dotenv";

config();

var s3 = new S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
});

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
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    // @ts-ignore
    if (user.accountType !== "artist") {
      return res.status(401).json({
        errors: [
          { msg: "Only artists can create songs", param: "accountType" },
        ],
      });
    }

    let track = new Track({ ...req.body });

    // @ts-ignore
    track.artist = userId;

    // @ts-ignore
    track.cover = req.files.cover[0].location; // @ts-ignore
    track.coverKey = req.files.cover[0].key;

    // @ts-ignore
    track.source = req.files.track[0].location; // @ts-ignore
    track.sourceKey = req.files.track[0].key;
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
    let tracks = await Track.find({
      visible: true,
      type: "track",
    }).populate("artist", ["username", "image"]);
    res.json({ tracks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const getBeats = async (req: Request, res: Response) => {
  try {
    let beats = await Track.find({ visible: true, type: "beat" });
    res.json({ beats });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const getMixes = async (req: Request, res: Response) => {
  try {
    let mixes = await Track.find({ visible: true, type: "mix" });
    res.json({ mixes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

const getPodcasts = async (req: Request, res: Response) => {
  try {
    let podcasts = await Track.find({ visible: true, type: "podcast" });
    res.json({ podcasts });
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

    // @ts-ignore
    if (!track.visible) {
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
    if (!track.artist.equals(userId)) {
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

const deleteTrack = async (req: Request, res: Response) => {
  const id = req.params.id;
  // @ts-ignore
  let userId = req.userId;
  try {
    const track = await Track.findByIdAndDelete(id);

    if (!track) {
      return res.status(404).json({
        errors: [{ msg: "track not found" }],
      });
    }

    // @ts-ignore
    if (!track.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    // @ts-ignore
    let user = await User.findById(track.artist);

    if (user) {
      // @ts-ignore
      user.tracks = user.tracks.filter(
        (t: Types.ObjectId) => !track.equals(track.id)
      );
      await user.save();
    }

    // Delete files from s3 bucket

    // @ts-ignore
    await s3
      .deleteObject({
        Bucket: process.env.Bucket,
        // @ts-ignore
        Key: track.coverKey,
      })
      .promise();
    // @ts-ignore
    await s3
      .deleteObject({
        Bucket: process.env.Bucket,
        // @ts-ignore
        Key: track.sourceKey,
      })
      .promise();

    await Comment.deleteMany({ track: track.id });

    res.json({ track });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const updatePlays = async (req: Request, res: Response) => {
  let id = req.params.id;

  // @ts-ignore
  const userId = req.userId;

  interface IPlay {
    userId?: Types.ObjectId;
    deviceId?: String;
  }

  try {
    const { deviceId } = req.body;

    console.log(deviceId, userId);

    let track = await Track.findById(id);

    if (!track) {
      return res.status(404).json({
        errors: [
          {
            msg: "Track not found",
          },
        ],
      });
    }

    let play: IPlay | undefined;

    if (userId) {
      // @ts-ignore
      play = track.plays.find((l: IPlay) => l.userId === userId);
    }

    /* @TODO fix play bug */

    // update device id
    if (play) {
      play.deviceId !== deviceId;
      // @ts-ignore
      track.plays = track.plays.map((p: IPlay) => {
        if (p.userId?.equals(userId)) {
          p.deviceId = deviceId;
        }
        return p;
      });
    }

    if (!play) {
      // @ts-ignore
      play = track.plays.find((l: IPlay) => l.deviceId === deviceId);
    }

    // Update play if userId exists
    if (play) {
      // @ts-ignore
      if (!play.userId && userId && !play?.userId?.equals(userId)) {
        // @ts-ignore
        track.plays = track.plays.map((p: IPlay) => {
          if (p.deviceId === deviceId) {
            p.userId = userId;
          }
          return p;
        });
      }
    }

    // Create play if it doesnt exist
    if (!play) {
      if (userId) {
        play = { userId, deviceId };
      } else {
        play = { deviceId };
      }

      // @ts-ignore
      track.plays = [...track.plays, play];
    }

    await track?.save();
    res.json({ track });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

export {
  createTrack,
  getTracks,
  getTrack,
  likeTrack,
  changeVisibility,
  deleteTrack,
  updatePlays,
  getBeats,
  getMixes,
  getPodcasts,
};

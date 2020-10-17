import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import Album from "../models/album.model";
import User from "../models/user.model";
import { config } from "dotenv";
import { S3 } from "aws-sdk";

config();

var s3 = new S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
});

const getAlbums = async (req: Request, res: Response) => {
  try {
    let albums = await Album.find({ visible: true });

    res.json({ albums });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const getAlbum = async (req: Request, res: Response) => {
  let id = req.params.id;
  try {
    let album = await Album.findById(id).where({ visible: true });

    if (!album) {
      return res.status(404).json({ errors: [{ msg: "Album not found" }] });
    }

    res.json({ album });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const createalbum = async (req: Request, res: Response) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array(),
    });
  }

  // @ts-ignore
  const userId = req.userId;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    // @ts-ignore
    if (user.accountType !== "artist") {
      return res.status(401).json({
        errors: [
          { msg: "Only artists can create albums", param: "accountType" },
        ],
      });
    }

    const { tracks, title } = req.body;
    let album = new Album({ tracks, title });

    if (req.file) {
      // @ts-ignore
      album.cover = req.files.cover[0].location; // @ts-ignore
      album.coverKey = req.files.cover[0].key;
    }

    // @ts-ignore
    album.artist = userId;

    await album.save();
    res.json({ album });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const changeVisibility = async (req: Request, res: Response) => {
  let id = req.params.id;
  try {
    let album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({ errors: [{ msg: "Album not found" }] });
    }

    //   @ts-ignore
    const userId = req.userId;
    //   @ts-ignore
    if (!album.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    //   @ts-ignore
    album.visible = !album.visible;

    await album.save();

    res.json({ album });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const addTrackToAlbum = async (req: Request, res: Response) => {
  let id = req.params.id;
  //   @ts-ignore
  const userId = req.userId;
  try {
    const { track } = req.body;
    let album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({ errors: [{ msg: "Album not found" }] });
    }

    //   @ts-ignore
    if (!album.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    //   @ts-ignore
    if (!album.tracks.includes(track)) {
      //   @ts-ignore
      if (album.tracks.length === 0) {
        //   @ts-ignore
        album.tracks = [track];
      }
      //   @ts-ignore
      else album.tracks = [...album.track, track];
    } else {
      //   @ts-ignore
      album.tracks = album.tracks.filter(
        (p: Types.ObjectId) => !p.equals(track)
      );
    }

    await album.save();

    res.json({ album });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const deleteAlbum = async (req: Request, res: Response) => {
  let id = req.params.id;
  //   @ts-ignore
  const userId = req.userId;
  try {
    let album = await Album.findByIdAndDelete(id);

    if (!album) {
      return res.status(404).json({ errors: [{ msg: "Album not found" }] });
    }

    //   @ts-ignore
    if (!album.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    // @ts-ignore
    if (album.coverKey) {
      // @ts-ignore
      await s3
        .deleteObject({
          Bucket: process.env.Bucket,
          // @ts-ignore
          Key: album.coverKey,
        })
        .promise();
    }

    res.json({ album });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

export {
  createalbum,
  changeVisibility,
  addTrackToAlbum,
  deleteAlbum,
  getAlbum,
  getAlbums,
};

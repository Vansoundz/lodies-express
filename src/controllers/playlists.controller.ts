import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import Playlist from "../models/playlist.model";

const getPlaylists = async (req: Request, res: Response) => {
  try {
    let playlists = await Playlist.find({ visible: true });

    res.json({ playlists });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const getPlaylist = async (req: Request, res: Response) => {
  let id = req.params.id;
  try {
    let playlist = await Playlist.findById(id).where({ visible: true });

    if (!playlist) {
      return res.status(404).json({ errors: [{ msg: "Playlist not found" }] });
    }

    res.json({ playlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const createplaylist = async (req: Request, res: Response) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array(),
    });
  }

  // @ts-ignore
  const userId = req.userId;
  try {
    const { tracks, title } = req.body;
    let playlist = new Playlist({ tracks, title });

    if (req.file) {
      // @ts-ignore
      playlist.cover = req.file.filename;
    }

    // @ts-ignore
    playlist.user = userId;

    await playlist.save();
    res.json({ playlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const changeVisibility = async (req: Request, res: Response) => {
  let id = req.params.id;
  // @ts-ignore
  let userId = req.userId;

  try {
    let playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ errors: [{ msg: "Playlist not found" }] });
    }

    // @ts-ignore
    if (!playlist.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    //   @ts-ignore
    playlist.visible = !playlist.visible;

    await playlist.save();

    res.json({ playlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const addTrackToPlaylist = async (req: Request, res: Response) => {
  let id = req.params.id;
  // @ts-ignore
  let userId = req.userId;
  try {
    const { track } = req.body;
    let playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ errors: [{ msg: "Playlist not found" }] });
    }

    // @ts-ignore
    if (!playlist.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    //   @ts-ignore
    if (!playlist.tracks.includes(track)) {
      //   @ts-ignore
      if (playlist.tracks.length === 0) {
        //   @ts-ignore
        playlist.tracks = [track];
      }
      //   @ts-ignore
      else playlist.tracks = [...playlist.track, track];
    } else {
      //   @ts-ignore
      playlist.tracks = playlist.tracks.filter(
        (p: Types.ObjectId) => !p.equals(track)
      );
    }

    await playlist.save();

    res.json({ playlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const deletePlaylist = async (req: Request, res: Response) => {
  let id = req.params.id;
  // @ts-ignore
  let userId = req.userId;
  try {
    let playlist = await Playlist.findByIdAndDelete(id);

    if (!playlist) {
      return res.status(404).json({ errors: [{ msg: "Playlist not found" }] });
    }

    // @ts-ignore
    if (!playlist.artist.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    res.json({ playlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

export {
  createplaylist,
  changeVisibility,
  addTrackToPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
};

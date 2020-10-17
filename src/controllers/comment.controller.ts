import { Types } from "mongoose";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Comment from "../models/comment.model";
import Track from "../models/track.model";

const createComment = async (req: Request, res: Response) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array(),
    });
  }
  let id = req.params.id;
  // @ts-ignore
  let userId = req.userId;
  try {
    let track = await Track.findById(id);

    if (!track) {
      return res.status(404).json({
        errors: [{ msg: "Track not found" }],
      });
    }

    let comment = new Comment({ ...req.body });

    // @ts-ignore
    comment.track = track.id;

    // @ts-ignore
    comment.user = userId;

    // @ts-ignore
    track.comments = [...track.comments, comment.id];

    await track.save();
    await comment.save();

    res.json({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array(),
    });
  }
  let id = req.params.id;
  try {
    let comment = await Comment.findByIdAndUpdate(id, {
      $set: { body: req.body.body },
    });

    if (!comment) {
      return res.status(404).json({
        errors: [{ msg: "Comment not found" }],
      });
    }

    res.json({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const hideShowComment = async (req: Request, res: Response) => {
  const id = req.params.id;
  // @ts-ignore
  let userId = req.userId;
  try {
    let comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        errors: [{ msg: "Comment not found" }],
      });
    }

    // @ts-ignore
    if (!comment.user.equals(userId)) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized action" }] });
    }

    //   @ts-ignore
    comment.visible = !comment.visible;

    await comment.save();

    res.json({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        errors: [{ msg: "Comment not found" }],
      });
    }

    //   @ts-ignore
    let track = await Track.findById(comment.track);

    if (track) {
      //   @ts-ignore
      track.comments = track.comments.filter(
        (com: Types.ObjectId) => !com.equals(comment.id)
      );
      await track.save();
    }

    res.json({ comment });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [{ msg: "Server error" }],
    });
  }
};

export { createComment, updateComment, hideShowComment, deleteComment };

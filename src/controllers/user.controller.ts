import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const getUser = async (req: Request, res: Response) => {
  // @ts-ignore
  let id = req.userId;
  try {
    let user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(401).json({ errors: [{ msg: "Unauthorized" }] });
    }

    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const register = async (req: Request, res: Response) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email });

    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "email is taken", param: "email" }] });
    }

    user = await User.findOne({ username: req.body.username });
    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "username is taken", param: "username" }] });
    }

    user = new User({ ...req.body });

    let salt = await bcrypt.genSalt(10);
    // @ts-ignore
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    user = await User.findById(user.id).select("-password");

    // @ts-ignore
    let token = jwt.sign({ userId: user?.id }, process.env.JWT_SECRET, {
      expiresIn: `48h`,
    });
    res.json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.findOne({ username: email });
    }

    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: "User does not exist", param: "email" }] });
    }

    //   @ts-ignore
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Wrong password", param: "password" }] });
    }

    user = await User.findById(user.id).select("-password");
    // @ts-ignore
    let token = jwt.sign({ userId: user?.id }, process.env.JWT_SECRET, {
      expiresIn: `48h`,
    });
    res.json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  let id = req.userId;
  const body = req.body;
  try {
    let user = await User.findById(id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Profile not found", param: "profile" }] });
    }

    if (req.file) {
      // @ts-ignore
      user.image = req.file.filename;
    }

    Object.keys(body).forEach((key) => {
      // @ts-ignore
      user[key] = body[key];
    });

    await user.save();

    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

export { register, login, getUser, updateProfile };

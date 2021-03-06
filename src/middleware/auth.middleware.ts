import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

config();

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies.__lodies;
    // let token = req.headers.authorization;

    if (!token)
      return res.status(401).send({
        errors: [{ msg: "Unauthorized" }],
      });

    // @ts-ignore
    let decoded = jwt.verify(token, process.env.JWT_SECRET);

    // @ts-ignore
    if (!decoded.userId)
      return res.status(401).send({
        errors: [{ msg: "Unauthorized" }],
      });

    // @ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).send({
      errors: [{ msg: "Unauthorized" }],
    });
  }
};

export const setUserId = (req: Request, res: Response, next: NextFunction) => {
  try {
    // let token = req.headers.authorization;
    let token = req.cookies.__lodies;

    if (token) {
      // @ts-ignore
      let decoded = jwt.verify(token, process.env.JWT_SECRET);
      // @ts-ignore
      if (decoded.userId)
        // @ts-ignore
        req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    next();
  }
};

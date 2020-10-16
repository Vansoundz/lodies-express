import { Router } from "express";
import { mkdirSync } from "fs";
import multer from "multer";
import {
  changeVisibility,
  createTrack,
  getTrack,
  getTracks,
  likeTrack,
} from "../controllers/track.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// var s3 = new S3({
//   accessKeyId: process.env.AWSAccessKeyId,
//   secretAccessKey: process.env.AWSSecretKey,
// });

// var upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: "moonre",
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(null, `${Date.now()}${file.originalname}`);
//     },
//   }),
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = `./src/files`;
    const mimetype = file.mimetype;
    if (mimetype.includes(`audio`)) {
      path = `${path}/audio/`;
    }
    if (mimetype.includes(`image`)) {
      path = `${path}/images/`;
    }
    // @ts-ignore

    mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(
  `/`,
  [
    authMiddleware,
    upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "track", maxCount: 1 },
    ]),
  ],
  createTrack
);
router.get(`/`, getTracks);
router.get(`/:id`, getTrack);
router.patch(`/:id/like`, authMiddleware, likeTrack);
router.patch(`/:id/visibility`, authMiddleware, changeVisibility);

export default router;

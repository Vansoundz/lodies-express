import { S3 } from "aws-sdk";
import { Router } from "express";
import { config } from "dotenv";
import multer from "multer";
import {
  createComment,
  deleteComment,
  hideShowComment,
  updateComment,
} from "../controllers/comment.controller";
import {
  changeVisibility,
  createTrack,
  deleteTrack,
  getBeats,
  getMixes,
  getPodcasts,
  getTrack,
  getTracks,
  likeTrack,
  updatePlays,
} from "../controllers/track.controller";
import auth, { setUserId } from "../middleware/auth.middleware";
import multerS3 from "multer-s3";

const router = Router();

config();

var s3 = new S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
});

var upload = multer({
  storage: multerS3({
    s3: s3,
    // @ts-ignore
    bucket: process.env.Bucket,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // @ts-ignore
      let userId = req.userId || "unknown";

      const mimetype = file.mimetype;
      let folder = "misc";

      if (mimetype.includes("audio")) {
        folder = `audio/${userId}`;
      }
      if (mimetype.includes("image")) {
        folder = `covers/${userId}`;
      }
      cb(null, `${folder}/${Date.now()}${file.originalname}`);
    },
  }),
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     let path = `./src/files`;
//     const mimetype = file.mimetype;
//     if (mimetype.includes(`audio`)) {
//       path = `${path}/audio/`;
//     }
//     if (mimetype.includes(`image`)) {
//       path = `${path}/images/`;
//     }
//     // @ts-ignore

//     mkdirSync(path, { recursive: true });
//     cb(null, path);
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}${file.originalname}`);
//   },
// });

// const upload = multer({ storage: storage });

router.post(
  `/`,
  [
    auth,
    upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "track", maxCount: 1 },
    ]),
  ],
  createTrack
);
router.get(`/`, getTracks);
router.get(`/beats`, getBeats);
router.get(`/mixes`, getMixes);
router.get(`/podcasts`, getPodcasts);
router.get(`/:id`, getTrack);
router.patch(`/:id/play`, setUserId, updatePlays);
router.delete(`/:id`, auth, deleteTrack);
router.patch(`/:id/like`, auth, likeTrack);
router.patch(`/:id/visibility`, auth, changeVisibility);
router.patch(`/:id/comment`, auth, createComment);
router.patch(`/comments/:id`, auth, updateComment);
router.delete(`/comments/:id`, auth, deleteComment);
router.patch(`/comments/:id/hide-show`, auth, hideShowComment);

export default router;

import { Router } from "express";
import { check } from "express-validator";
import multer from "multer";
import {
  addTrackToPlaylist,
  changeVisibility,
  createplaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
} from "../controllers/playlists.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = `./src/files/covers`;
    // @ts-ignore

    mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.get(`/`, getPlaylists);
router.get(`/:id`, getPlaylist);
router.post(
  `/`,
  [
    auth,
    check("title").notEmpty().withMessage("Title is required"),
    upload.single("image"),
  ],
  createplaylist
);
router.patch(`/:id/hide-show`, auth, changeVisibility);
router.delete(`/:id`, auth, deletePlaylist);
router.patch(`/:id/add-track`, auth, addTrackToPlaylist);

export default router;

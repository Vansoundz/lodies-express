import { Router } from "express";
import { check } from "express-validator";
import multer from "multer";
import {
  addTrackToAlbum,
  changeVisibility,
  createalbum,
  deleteAlbum,
  getAlbum,
  getAlbums,
} from "../controllers/album.controller";
import auth from "../middleware/auth.middleware";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = `./src/files/albums`;
    // @ts-ignore

    mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.get(`/`, getAlbums);
router.get(`/:id`, getAlbum);
router.post(
  `/`,
  [
    auth,
    check("title").notEmpty().withMessage("Title is required"),
    upload.single("image"),
  ],
  createalbum
);
router.patch(`/:id/hide-show`, auth, changeVisibility);
router.delete(`/:id`, auth, deleteAlbum);
router.patch(`/:id/add-track`, auth, addTrackToAlbum);

export default router;

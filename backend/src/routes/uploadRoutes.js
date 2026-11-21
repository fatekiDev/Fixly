import { Router } from "express";
import { getImage, uploadImage } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/authenticate.js";
import { imageUpload } from "../middleware/imageUpload.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.get("/:id", authenticate, getImage);
router.post(
  "/",
  authenticate,
  requireRole("member", "manager"),
  imageUpload.single("file"),
  uploadImage,
);

export default router;

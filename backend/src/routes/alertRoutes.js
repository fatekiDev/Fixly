import { Router } from "express";
import {
  acceptAlert,
  createAlert,
  getAlert,
  getMemberPoints,
  listAlerts,
  listPendingClosures,
  listPendingModeration,
  moderateAlert,
  releaseAlert,
  resolveAlert,
  reviewClosure,
} from "../controllers/alertController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();
router.use(authenticate);

router.get("/", listAlerts);
router.post("/", requireRole("member"), createAlert);
router.get("/moderation/pending", requireRole("admin"), listPendingModeration);
router.get("/closures/pending", requireRole("admin"), listPendingClosures);
router.get("/points/:userId", getMemberPoints);
router.post("/:id/accept", requireRole("manager"), acceptAlert);
router.post("/:id/release", requireRole("manager"), releaseAlert);
router.post("/:id/resolve", requireRole("manager"), resolveAlert);
router.post("/:id/moderation", requireRole("admin"), moderateAlert);
router.post("/:id/review", requireRole("admin"), reviewClosure);
router.get("/:id", getAlert);

export default router;

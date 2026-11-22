import { Router } from "express";
import { listManagers, listUsers } from "../controllers/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();
router.use(authenticate);

router.get("/managers", requireRole("manager", "admin"), listManagers);
router.get("/", requireRole("admin"), listUsers);

export default router;

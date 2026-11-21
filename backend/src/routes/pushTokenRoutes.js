import { Router } from "express";
import { registerPushToken, unregisterPushToken } from "../controllers/pushTokenController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);
router.post("/register", registerPushToken);
router.post("/unregister", unregisterPushToken);

export default router;

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { currentUser, login, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera unos minutos e inténtalo otra vez." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, currentUser);

export default router;

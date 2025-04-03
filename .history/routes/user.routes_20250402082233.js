import express from "express";
import { 
  getUserPreferences,
  updatePreferences
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/preferences", authMiddleware, getUserPreferences);
router.put("/preferences", authMiddleware, updatePreferences);

export default router;
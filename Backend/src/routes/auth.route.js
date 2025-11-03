import express from "express"
import { getProfile, googleCallback, googleLogin, logout } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const authRoutes = express.Router()

authRoutes.get("/google", googleLogin);
authRoutes.get("/google/callback", googleCallback);
authRoutes.get("/logout", logout);
authRoutes.get("/profile", authMiddleware, getProfile);

export default authRoutes
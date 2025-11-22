import express from "express";
import { GC, logout } from "../controllers/auth.controller.js";
const authRoutes = express.Router();

authRoutes.get("/logout", logout);

authRoutes.get("/google/callback1", GC);
export default authRoutes;

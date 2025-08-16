import express from "express";
import { uploadMiddleware, analyzeResume, getHistory } from "../controllers/resumeController.js";
const router = express.Router();
router.post("/analyze", uploadMiddleware, analyzeResume);
router.get("/history", getHistory);
export default router;

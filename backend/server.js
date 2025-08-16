import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import resumeRoutes from "./routes/resumeRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/atschecker";
mongoose.connect(MONGO_URI).then(() => console.log("MongoDB connected")).catch(err => console.error("MongoDB error:", err.message));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/reports", express.static(path.join(__dirname, "reports")));

app.use("/api/resume", resumeRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

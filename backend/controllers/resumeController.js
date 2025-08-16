import fs from "fs";
import path from "path";
import multer from "multer";
import OpenAI from "openai";
import Analysis from "../models/Analysis.js";
import { parseResume } from "../utils/parseResume.js";
import { scoreResume } from "../utils/scoring.js";
import { generateReportPDF } from "../utils/pdfReport.js";

const upload = multer({ dest: "uploads/" });
export const uploadMiddleware = upload.single("resume");

export const analyzeResume = async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || "";
    if (!req.file) return res.status(400).json({ error: "Resume file is required" });

    const filePath = req.file.path;
    const resumeText = await parseResume(filePath, req.file.originalname);
    fs.unlink(filePath, () => {});

    const { score, missingKeywords } = await scoreResume({
      resumeText, jobDescription, openaiApiKey: process.env.OPENAI_API_KEY
    });

    let suggestions = "";
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `You are an ATS optimization assistant. Based on the resume and job description, write 4-6 concise, highly actionable bullet suggestions to improve the resume for this job. Return plain text bullets (no JSON).
Resume:
"""${resumeText.slice(0, 8000)}"""
Job Description:
"""${jobDescription.slice(0, 4000)}"""`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });
      suggestions = completion.choices?.[0]?.message?.content?.trim() || "";
    } catch {
      suggestions = "• Tailor the summary to match the JD.\n• Add measurable achievements.\n• Include missing keywords in context.\n• Prioritize relevant experience.";
    }

    const reportsDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
    const reportFile = await generateReportPDF({ outDir: reportsDir, data: { score, missingKeywords, suggestions, jobDescription, resumeText } });

    const analysis = await Analysis.create({ resumeText, jobDescription, score, missingKeywords, suggestions, reportFile });

    return res.json({ _id: analysis._id, score, missingKeywords, suggestions, reportUrl: `/reports/${reportFile}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const items = await Analysis.find({}).sort({ createdAt: -1 }).limit(20);
    res.json(items.map(i => ({ _id: i._id, createdAt: i.createdAt, score: i.score, missingKeywords: i.missingKeywords, reportUrl: i.reportFile ? `/reports/${i.reportFile}` : "" })));
  } catch {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

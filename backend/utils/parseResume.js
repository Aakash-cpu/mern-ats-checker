import { readFile } from "fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

async function extractPdfText(filePath) {
  // Read as Buffer, then convert to Uint8Array (what pdfjs expects)
  const buf = await readFile(filePath);
  const data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map(it => it.str).join(" ") + "\n";
  }
  return out.trim();
}

export async function parseResume(filePath, originalName) {
  const lower = (originalName || "").toLowerCase();
  try {
    if (lower.endsWith(".pdf"))   return await extractPdfText(filePath);
    if (lower.endsWith(".docx"))  {
      const result = await mammoth.extractRawText({ path: filePath });
      return (result.value || "").trim();
    }
    if (lower.endsWith(".txt"))   return await readFile(filePath, "utf-8");
    // Fallback best-effort
    return await readFile(filePath, "utf-8");
  } catch (err) {
    console.error("parseResume error:", err);
    return ""; // keep the request from failing
  }
}

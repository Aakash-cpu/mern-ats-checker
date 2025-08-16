import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
export async function generateReportPDF({ outDir, data }){
  const name=`report-${Date.now()}.pdf`; const filePath=path.join(outDir,name);
  const doc=new PDFDocument({margin:40}); const stream=fs.createWriteStream(filePath); doc.pipe(stream);
  doc.fontSize(20).text("AI Resume / ATS Checker Report",{underline:true}); doc.moveDown();
  doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`); doc.moveDown();
  doc.fontSize(14).text(`ATS Score: ${data.score}/100`); doc.moveDown();
  doc.fontSize(13).text("Missing Keywords:"); if(data.missingKeywords?.length){doc.fontSize(12).list(data.missingKeywords);} else {doc.fontSize(12).text("None 🎉");}
  doc.moveDown(); doc.fontSize(13).text("Suggestions:"); doc.fontSize(12).text(data.suggestions||"—"); doc.moveDown();
  doc.fontSize(13).text("Job Description (excerpt):"); doc.fontSize(10).text((data.jobDescription||"").slice(0,1500)||"—"); doc.moveDown();
  doc.fontSize(13).text("Resume (excerpt):"); doc.fontSize(10).text((data.resumeText||"").slice(0,1500)||"—");
  doc.end(); await new Promise(r=>stream.on("finish",r)); return name;
}

// Keyword + semantic scoring using OpenAI embeddings
import OpenAI from "openai";
function tokenize(text){return (text||"").toLowerCase().replace(/[^a-z0-9+.# ]/g," ").split(/\s+/).filter(Boolean)}
function uniqueKeywords(text){const t=tokenize(text);const stop=new Set(["and","or","the","a","an","to","of","in","for","with","on","by","at","as","is","are","be","this","that","it"]);return Array.from(new Set(t.filter(x=>!stop.has(x)&&x.length>2)))}
function cosine(a,b){const d=a.reduce((s,v,i)=>s+v*b[i],0),ma=Math.hypot(...a),mb=Math.hypot(...b);return ma&&mb?d/(ma*mb):0}
export async function scoreResume({resumeText,jobDescription,openaiApiKey}){
  const r=uniqueKeywords(resumeText), j=uniqueKeywords(jobDescription), setJD=new Set(j);
  const found=r.filter(k=>setJD.has(k)); const missing=j.filter(k=>!new Set(found).has(k));
  const cov=j.length?found.length/j.length:0; let sem=0;
  try{const o=new OpenAI({apiKey:openaiApiKey});
    const [eJD,eCV]=await Promise.all([o.embeddings.create({model:"text-embedding-3-small",input:jobDescription}),o.embeddings.create({model:"text-embedding-3-small",input:resumeText})]);
    sem=cosine(eCV.data[0].embedding,eJD.data[0].embedding);}catch{}
  const score=Math.round((cov*0.7+sem*0.3)*100);
  return {score, missingKeywords: missing};
}

import React, { useState } from 'react'
import axios from 'axios'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
export default function Home({ onReport }) {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append('resume', resumeFile)
      form.append('jobDescription', jobDescription)
      const res = await axios.post(`${API_BASE}/api/resume/analyze`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      onReport(res.data); await fetchHistory()
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to analyze')
    } finally { setLoading(false) }
  }
  const fetchHistory = async () => { try { const res = await axios.get(`${API_BASE}/api/resume/history`); setHistory(res.data || []) } catch {} }
  React.useEffect(() => { fetchHistory() }, [])
  return (
    <div className="card" style={{marginBottom: 20}}>
      <h1 className="h1">AI Resume / ATS Checker</h1>
      <p className="muted">Upload your resume (PDF/DOCX/TXT), paste the job description, and get an ATS score, missing keywords, and a downloadable PDF report.</p>
      <div className="row" style={{marginTop: 16}}>
        <div>
          <label>Resume file</label>
          <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setResumeFile(e.target.files[0])} />
        </div>
        <div>
          <label>Job description</label>
          <textarea placeholder="Paste the JD here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </div>
      </div>
      <div style={{marginTop: 16, display: 'flex', gap: 12}}>
        <button onClick={handleAnalyze} disabled={loading || !resumeFile || !jobDescription.trim()}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
        <a className="link" href="#" onClick={(e) => {e.preventDefault(); setJobDescription('');}}>Clear JD</a>
      </div>
      <div style={{marginTop: 28}}>
        <h3 style={{marginBottom: 8}}>Recent reports</h3>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {history.map(h => (
            <span key={h._id} className="badge">
              {new Date(h.createdAt).toLocaleString()} — Score: {h.score} &nbsp;
              {h.reportUrl ? <a className="link" href={`${API_BASE}${h.reportUrl}`} target="_blank" rel="noreferrer">PDF</a> : null}
            </span>
          ))}
          {!history.length && <span className="muted">No history yet.</span>}
        </div>
      </div>
    </div>
  )
}

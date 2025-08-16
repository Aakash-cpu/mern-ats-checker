import React from 'react'
export default function Report({ report }) {
  if (!report) return null
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Result</h2>
      <div className="gauge-wrap"><div>ATS Score</div><div className="gauge">{report.score}</div></div>
      <div style={{marginTop: 18}}>
        <h3>Missing keywords</h3>
        {report.missingKeywords?.length ? (
          <div style={{display:'flex', flexWrap:'wrap'}}>
            {report.missingKeywords.map((k,i) => <span key={i} className="badge">{k}</span>)}
          </div>
        ) : <p className="muted">None 🎉</p>}
      </div>
      <div style={{marginTop: 18}}>
        <h3>Suggestions</h3>
        <pre style={{whiteSpace:'pre-wrap'}}>{report.suggestions}</pre>
      </div>
      {report.reportUrl && (
        <div style={{marginTop: 18}}>
          <a className="link" href={`http://localhost:5000${report.reportUrl}`} target="_blank" rel="noreferrer">Download full PDF report</a>
        </div>
      )}
    </div>
  )
}

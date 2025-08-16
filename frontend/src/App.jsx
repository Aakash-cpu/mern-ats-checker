import React, { useState } from 'react'
import Home from './pages/Home.jsx'
import Report from './pages/Report.jsx'
export default function App() {
  const [report, setReport] = useState(null)
  return (<div className="container"><Home onReport={setReport} /><Report report={report} /></div>)
}

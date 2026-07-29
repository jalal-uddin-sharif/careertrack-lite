import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function SkillList({ items, emptyText }) {
  if (!items?.length) return <p>{emptyText}</p>
  return <div className="skill-list">{items.map((item) => <span key={item}>{item}</span>)}</div>
}

function JdScanner() {
  const [form, setForm] = useState({ company: '', role: '', jobDescription: '' })
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const scanJob = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/career/jd-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)
      setResult(data)
    } catch (error) {
      setMessage(error.message || 'Could not scan this job description.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="assistant-stack">
      <form className="assistant-panel assistant-form" onSubmit={scanJob}>
        <div className="section-heading">
          <div><h2>JD scan</h2><p>Compare a job description with your saved profile.</p></div>
        </div>
        <div className="assistant-form-grid">
          <label>Company *<input name="company" value={form.company} onChange={updateField} required /></label>
          <label>Role *<input name="role" value={form.role} onChange={updateField} required /></label>
        </div>
        <label>Job description *<textarea name="jobDescription" rows="10" value={form.jobDescription} onChange={updateField} required /></label>
        <p className="form-help">The scan uses only your profile and the text pasted here.</p>
        {message && <p className="alert error-message">{message}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Scanning...' : 'Scan job description'}</button>
      </form>

      {result && (
        <section className="assistant-panel scan-result">
          <div className="scan-score">
            <div><span>Estimated match score</span><strong>{result.estimatedMatchScore}%</strong></div>
            <div><span>Verdict</span><strong>{result.verdict}</strong></div>
          </div>

          <h3>1. Role snapshot</h3>
          <p><strong>{result.roleSnapshot.role}</strong> at {result.roleSnapshot.company} · Confidence: {result.roleSnapshot.confidence}</p>
          <SkillList items={result.roleSnapshot.detectedRequirements} emptyText="No common technical requirements detected." />

          <h3>2. Why this score</h3>
          <ul>{result.whyThisScore.map((reason) => <li key={reason}>{reason}</li>)}</ul>

          <h3>3. Gap analysis</h3>
          <p><strong>Matched:</strong></p>
          <SkillList items={result.gapAnalysis.matchedSkills} emptyText="No matching technical keywords found." />
          <p><strong>Missing or unproven:</strong></p>
          <SkillList items={result.gapAnalysis.missingSkills} emptyText="No detected skill gaps." />

          <h3>4. Resume targeting advice</h3>
          <p>{result.resumeTargetingAdvice.headline}</p>
          <ul>{result.resumeTargetingAdvice.improvements.map((item) => <li key={item}>{item}</li>)}</ul>

          <h3>5. Apply strategy</h3><p>{result.applyStrategy}</p>
          <h3>6. Red flags</h3><ul>{result.redFlags.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>7. Final action recommendation</h3><p className="final-verdict">{result.finalActionRecommendation}</p>
        </section>
      )}
    </div>
  )
}

export default JdScanner

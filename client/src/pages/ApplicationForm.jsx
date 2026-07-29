import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StudentFooter from '../components/StudentFooter'

const API_URL = import.meta.env.VITE_API_URL || ''
const today = () => new Date().toISOString().split('T')[0]

const emptyForm = {
  applicationDate: today(),
  companyName: '',
  jobTitle: '',
  jobUrl: '',
  jobDescription: '',
  jdKeywords: '',
  matchScore: 0,
  verdict: 'Not checked',
  applied: false,
  response: '',
  taskReceived: false,
  interviewAttempted: false,
  rejected: false,
  offer: false,
  onFollowUp: false,
  source: 'LinkedIn',
  resumeVersionUsed: '',
  outreachSent: false,
  followUpDate: '',
  status: 'Saved',
  redFlags: '',
  nextBestAction: '',
  notes: '',
}

const checkFields = [
  ['applied', 'Applied'],
  ['taskReceived', 'Task received'],
  ['interviewAttempted', 'Interview attempted'],
  ['rejected', 'Rejected'],
  ['offer', 'Offer'],
  ['onFollowUp', 'On follow-up'],
  ['outreachSent', 'Outreach sent'],
]

function ApplicationForm({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const [error, setError] = useState('')
  const [assistantMessage, setAssistantMessage] = useState('')

  useEffect(() => {
    if (!isEditing) return

    const getApplication = async () => {
      try {
        const response = await fetch(`${API_URL}/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load application.')
        setFormData({
          ...emptyForm,
          ...data,
          jdKeywords: data.jdKeywords?.join(', ') || '',
        })
      } catch (err) {
        setError(err.message || 'Cannot connect to the server.')
      } finally {
        setPageLoading(false)
      }
    }
    getApplication()
  }, [id, isEditing])

  const handleChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormData({ ...formData, [event.target.name]: value })
  }

  const analyzeJob = async () => {
    setError('')
    setAssistantMessage('')
    if (!formData.jobUrl || !formData.jobDescription) {
      setError('Paste both the job URL and job description first.')
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch(`${API_URL}/api/applications/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          jobUrl: formData.jobUrl,
          jobDescription: formData.jobDescription,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setFormData((current) => ({
        ...current,
        ...data,
        companyName: data.companyName || current.companyName,
        jobTitle: data.jobTitle || current.jobTitle,
        jdKeywords: data.jdKeywords.join(', '),
      }))
      setAssistantMessage('Assistant analysis complete. Please review the filled fields before saving.')
    } catch (err) {
      setError(err.message || 'Could not analyze this job.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!formData.companyName || !formData.jobTitle || !formData.applicationDate) {
      setError('Company, role and date are required.')
      return
    }

    setLoading(true)
    try {
      const url = isEditing ? `${API_URL}/api/applications/${id}` : `${API_URL}/api/applications`
      const payload = {
        ...formData,
        jdKeywords: formData.jdKeywords.split(',').map((item) => item.trim()).filter(Boolean),
      }
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not save application.')
      navigate('/applications')
    } catch (err) {
      setError(err.message || 'Cannot connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar onLogout={onLogout} />
      <section className="form-page-container">
        <Link className="back-link" to="/applications">&larr; Back to applications</Link>
        <div className="application-form-card wide-form-card">
          <div className="page-header form-page-header">
            <div>
              <p className="eyebrow">APPLICATION DETAILS</p>
              <h1>{isEditing ? 'Edit application' : 'Add application'}</h1>
              <p>Paste the job information, let the assistant fill supported fields, then review and save.</p>
            </div>
          </div>

          {pageLoading ? <div className="content-state">Loading application...</div> : (
            <form className="application-form" onSubmit={handleSubmit}>
              <div className="assistant-fill-box">
                <div className="input-group">
                  <label htmlFor="jobUrl">Job link *</label>
                  <input id="jobUrl" name="jobUrl" type="url" value={formData.jobUrl} onChange={handleChange} placeholder="https://..." />
                </div>
                <div className="input-group">
                  <label htmlFor="jobDescription">Job description *</label>
                  <textarea id="jobDescription" name="jobDescription" rows="8" value={formData.jobDescription} onChange={handleChange} placeholder="Paste the complete job description here..." />
                </div>
                <button className="assistant-fill-button" type="button" onClick={analyzeJob} disabled={analyzing}>
                  {analyzing ? 'Analyzing...' : 'Analyze and fill fields'}
                </button>
                {assistantMessage && <p className="alert success-message">{assistantMessage}</p>}
              </div>

              <div className="form-row three-columns">
                <div className="input-group"><label htmlFor="applicationDate">Date *</label><input id="applicationDate" name="applicationDate" type="date" value={formData.applicationDate} onChange={handleChange} /></div>
                <div className="input-group"><label htmlFor="companyName">Company *</label><input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} /></div>
                <div className="input-group"><label htmlFor="jobTitle">Role *</label><input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} /></div>
              </div>

              <div className="form-row">
                <div className="input-group"><label htmlFor="jdKeywords">JD keywords</label><input id="jdKeywords" name="jdKeywords" value={formData.jdKeywords} onChange={handleChange} placeholder="React, JavaScript, Node.js" /></div>
                <div className="input-group"><label htmlFor="matchScore">Match score</label><input id="matchScore" name="matchScore" type="number" min="0" max="100" value={formData.matchScore} onChange={handleChange} /></div>
              </div>

              <div className="form-row three-columns">
                <div className="input-group"><label htmlFor="verdict">Verdict</label><select id="verdict" name="verdict" value={formData.verdict} onChange={handleChange}><option>Not checked</option><option>Strong Apply</option><option>Apply After Minor Tweaks</option><option>Stretch Apply</option><option>Low ROI / Skip</option></select></div>
                <div className="input-group"><label htmlFor="source">Platform</label><select id="source" name="source" value={formData.source} onChange={handleChange}><option>LinkedIn</option><option>Bdjobs</option><option>Indeed</option><option>Wellfound</option><option>Facebook</option><option>Referral</option><option>Other</option></select></div>
                <div className="input-group"><label htmlFor="status">Current stage</label><select id="status" name="status" value={formData.status} onChange={handleChange}><option>Saved</option><option>Applied</option><option>Assessment</option><option>Interview</option><option>Rejected</option><option>Offer</option></select></div>
              </div>

              <div className="tracker-checks">
                {checkFields.map(([name, label]) => <label key={name}><input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} />{label}</label>)}
              </div>

              <div className="form-row three-columns">
                <div className="input-group"><label htmlFor="response">Response</label><input id="response" name="response" value={formData.response} onChange={handleChange} placeholder="No response / Replied..." /></div>
                <div className="input-group"><label htmlFor="resumeVersionUsed">Resume version used</label><input id="resumeVersionUsed" name="resumeVersionUsed" value={formData.resumeVersionUsed} onChange={handleChange} placeholder="Frontend v2" /></div>
                <div className="input-group"><label htmlFor="followUpDate">Follow-up date</label><input id="followUpDate" name="followUpDate" type="date" value={formData.followUpDate} onChange={handleChange} /></div>
              </div>

              <div className="input-group"><label htmlFor="redFlags">Red flags</label><textarea id="redFlags" name="redFlags" rows="3" value={formData.redFlags} onChange={handleChange} /></div>
              <div className="input-group"><label htmlFor="nextBestAction">Next best action</label><textarea id="nextBestAction" name="nextBestAction" rows="3" value={formData.nextBestAction} onChange={handleChange} /></div>
              <div className="input-group"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows="4" value={formData.notes} onChange={handleChange} /></div>

              {error && <p className="alert error-message">{error}</p>}
              <div className="form-buttons">
                <Link className="cancel-link" to="/applications">Cancel</Link>
                <button className="submit-button" type="submit" disabled={loading}>{loading ? 'Saving...' : isEditing ? 'Update application' : 'Save application'}</button>
              </div>
            </form>
          )}
        </div>
      </section>
      <StudentFooter />
    </main>
  )
}

export default ApplicationForm

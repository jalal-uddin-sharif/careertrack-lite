import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StudentFooter from '../components/StudentFooter'

const API_URL = import.meta.env.VITE_API_URL || ''

const getCurrentDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const emptyForm = {
  companyName: '',
  jobTitle: '',
  jobUrl: '',
  applicationDate: getCurrentDate(),
  source: 'LinkedIn',
  status: 'Applied',
  notes: '',
}

function ApplicationForm({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const getApplication = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not load application.')
        }

        setFormData({
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          jobUrl: data.jobUrl || '',
          applicationDate: data.applicationDate,
          source: data.source,
          status: data.status,
          notes: data.notes || '',
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
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.companyName || !formData.jobTitle || !formData.applicationDate) {
      setError('Company name, job title and application date are required.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const url = isEditing
        ? `${API_URL}/api/applications/${id}`
        : `${API_URL}/api/applications`

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not save application.')
      }

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

        <div className="application-form-card">
          <div className="page-header form-page-header">
            <div>
              <p className="eyebrow">APPLICATION DETAILS</p>
              <h1>{isEditing ? 'Edit application' : 'Add application'}</h1>
              <p>{isEditing ? 'Update your application information.' : 'Save a job opportunity to your tracker.'}</p>
            </div>
          </div>

          {pageLoading ? (
            <div className="content-state">Loading application...</div>
          ) : (
            <form className="application-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="companyName">Company name *</label>
                  <input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} disabled={loading} />
                </div>
                <div className="input-group">
                  <label htmlFor="jobTitle">Job title *</label>
                  <input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="jobUrl">Job post URL</label>
                <input id="jobUrl" name="jobUrl" type="url" placeholder="https://example.com/job" value={formData.jobUrl} onChange={handleChange} disabled={loading} />
              </div>

              <div className="form-row three-columns">
                <div className="input-group">
                  <label htmlFor="applicationDate">Application date *</label>
                  <input id="applicationDate" name="applicationDate" type="date" value={formData.applicationDate} onChange={handleChange} disabled={loading} />
                </div>
                <div className="input-group">
                  <label htmlFor="source">Source</label>
                  <select id="source" name="source" value={formData.source} onChange={handleChange} disabled={loading}>
                    <option>LinkedIn</option>
                    <option>Bdjobs</option>
                    <option>Indeed</option>
                    <option>Wellfound</option>
                    <option>Facebook</option>
                    <option>Referral</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={loading}>
                    <option>Saved</option>
                    <option>Applied</option>
                    <option>Assessment</option>
                    <option>Interview</option>
                    <option>Rejected</option>
                    <option>Offer</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" rows="5" placeholder="Add interview dates, contact details or other notes..." value={formData.notes} onChange={handleChange} disabled={loading}></textarea>
              </div>

              {error && <p className="alert error-message">{error}</p>}

              <div className="form-buttons">
                <Link className="cancel-link" to="/applications">Cancel</Link>
                <button className="submit-button" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : isEditing ? 'Update application' : 'Save application'}
                </button>
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

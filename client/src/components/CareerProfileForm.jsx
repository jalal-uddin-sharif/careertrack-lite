import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

const emptyProfile = {
  fullName: '',
  phone: '',
  location: '',
  targetJobTypes: '',
  workPreference: 'Remote or Hybrid',
  salaryPreference: '',
  experienceLevel: 'Fresher / Entry level',
  currentStatus: '',
  resumeSummary: '',
  keySkills: '',
  linkedin: '',
  github: '',
  portfolio: '',
  availability: '',
  weaknesses: '',
}

function CareerProfileForm() {
  const [form, setForm] = useState(emptyProfile)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/career/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await response.json()

        if (data) {
          setForm({
            ...emptyProfile,
            ...data,
            targetJobTypes: data.targetJobTypes?.join(', ') || '',
            keySkills: data.keySkills?.join(', ') || '',
            weaknesses: data.weaknesses?.join(', ') || '',
          })
        }
      } catch {
        setMessage('Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setMessage('Saving...')

    try {
      const payload = {
        ...form,
        targetJobTypes: form.targetJobTypes.split(','),
        keySkills: form.keySkills.split(','),
        weaknesses: form.weaknesses.split(','),
      }
      const response = await fetch(`${API_URL}/api/career/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)
      setMessage('Profile saved successfully.')
    } catch (error) {
      setMessage(error.message || 'Could not save your profile.')
    }
  }

  if (loading) return <div className="content-state">Loading profile...</div>

  return (
    <form className="assistant-panel assistant-form" onSubmit={saveProfile}>
      <div className="section-heading">
        <div>
          <h2>Student profile</h2>
          <p>This information is used as evidence during JD scans.</p>
        </div>
      </div>

      <div className="assistant-form-grid">
        <label>Full name *<input name="fullName" value={form.fullName} onChange={updateField} required /></label>
        <label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label>
        <label>Location<input name="location" value={form.location} onChange={updateField} /></label>
        <label>Target roles *<input name="targetJobTypes" value={form.targetJobTypes} onChange={updateField} placeholder="Frontend Developer, MERN Developer" required /></label>
        <label>Work preference
          <select name="workPreference" value={form.workPreference} onChange={updateField}>
            <option>Remote or Hybrid</option><option>Remote</option><option>Hybrid</option><option>On-site</option>
          </select>
        </label>
        <label>Experience level *
          <select name="experienceLevel" value={form.experienceLevel} onChange={updateField}>
            <option>Fresher / Entry level</option><option>Junior</option><option>Mid level</option><option>Senior</option>
          </select>
        </label>
        <label>Salary preference<input name="salaryPreference" value={form.salaryPreference} onChange={updateField} placeholder="Optional" /></label>
        <label>Availability<input name="availability" value={form.availability} onChange={updateField} placeholder="Immediately / 2 weeks" /></label>
        <label>Current status<input name="currentStatus" value={form.currentStatus} onChange={updateField} placeholder="Student, employed, job seeking..." /></label>
        <label>LinkedIn<input type="url" name="linkedin" value={form.linkedin} onChange={updateField} /></label>
        <label>GitHub<input type="url" name="github" value={form.github} onChange={updateField} /></label>
        <label>Portfolio<input type="url" name="portfolio" value={form.portfolio} onChange={updateField} /></label>
      </div>

      <label>Key skills (comma separated)<input name="keySkills" value={form.keySkills} onChange={updateField} placeholder="React, JavaScript, Node.js" /></label>
      <label>Known weaknesses (comma separated)<input name="weaknesses" value={form.weaknesses} onChange={updateField} placeholder="Testing, system design" /></label>
      <label>Resume summary<textarea name="resumeSummary" rows="5" value={form.resumeSummary} onChange={updateField} placeholder="Add only skills and experience you can prove." /></label>

      {message && <p className="assistant-message">{message}</p>}
      <button className="primary-button" type="submit">Save profile</button>
    </form>
  )
}

export default CareerProfileForm

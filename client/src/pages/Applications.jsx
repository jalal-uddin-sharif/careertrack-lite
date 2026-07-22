import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ApplicationCard from '../components/ApplicationCard'

const API_URL = import.meta.env.VITE_API_URL || ''

function Applications({ onLogout }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getApplications = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not load applications.')
        }

        setApplications(data)
      } catch (err) {
        setError(err.message || 'Cannot connect to the server.')
      } finally {
        setLoading(false)
      }
    }

    getApplications()
  }, [])

  const handleDelete = async (applicationId) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this application?')

    if (!shouldDelete) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete application.')
      }

      setApplications(applications.filter((application) => application._id !== applicationId))
    } catch (err) {
      setError(err.message || 'Cannot connect to the server.')
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar onLogout={onLogout} />

      <section className="content-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">JOB TRACKER</p>
            <h1>My applications</h1>
            <p>View and manage all your job applications.</p>
          </div>
          <Link className="primary-link" to="/applications/new">Add application</Link>
        </div>

        {error && <p className="alert error-message">{error}</p>}

        {loading ? (
          <div className="content-state">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="content-state empty-state">
            <h2>No applications yet</h2>
            <p>Add your first job application to start tracking your progress.</p>
            <Link className="primary-link" to="/applications/new">Add your first application</Link>
          </div>
        ) : (
          <div className="application-grid">
            {applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Applications

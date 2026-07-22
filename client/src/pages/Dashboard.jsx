import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import StudentFooter from '../components/StudentFooter'

const API_URL = import.meta.env.VITE_API_URL || ''

const emptyStats = {
  total: 0,
  saved: 0,
  applied: 0,
  assessment: 0,
  interview: 0,
  rejected: 0,
  offer: 0,
}

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(emptyStats)
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Could not load dashboard.')
        }

        setStats(data.stats)
        setRecentApplications(data.recentApplications)
      } catch (err) {
        setError(err.message || 'Cannot connect to the server.')
      } finally {
        setLoading(false)
      }
    }

    getDashboardData()
  }, [])

  return (
    <main className="dashboard-page">
      <Navbar onLogout={onLogout} />

      <section className="content-container dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">DASHBOARD</p>
            <h1>Welcome back</h1>
            <p>Here is an overview of your job search, {user.email}.</p>
          </div>
          <Link className="primary-link" to="/applications/new">Add application</Link>
        </div>

        {error && <p className="alert error-message">{error}</p>}

        {loading ? (
          <div className="content-state">Loading dashboard...</div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard label="Total" value={stats.total} color="dot-total" />
              <StatCard label="Saved" value={stats.saved} color="dot-saved" />
              <StatCard label="Applied" value={stats.applied} color="dot-applied" />
              <StatCard label="Assessments" value={stats.assessment} color="dot-assessment" />
              <StatCard label="Interviews" value={stats.interview} color="dot-interview" />
              <StatCard label="Rejected" value={stats.rejected} color="dot-rejected" />
              <StatCard label="Offers" value={stats.offer} color="dot-offer" />
            </div>

            <div className="recent-section">
              <div className="section-heading">
                <div>
                  <h2>Recently added</h2>
                  <p>Your five latest job applications.</p>
                </div>
                <Link to="/applications">View all</Link>
              </div>

              {recentApplications.length === 0 ? (
                <div className="recent-empty">
                  <p>You have not added any applications yet.</p>
                  <Link className="primary-link" to="/applications/new">Add your first application</Link>
                </div>
              ) : (
                <div className="recent-list">
                  {recentApplications.map((application) => (
                    <div className="recent-item" key={application._id}>
                      <div>
                        <strong>{application.jobTitle}</strong>
                        <span>{application.companyName}</span>
                      </div>
                      <span className="recent-date">{application.applicationDate}</span>
                      <StatusBadge status={application.status || 'Saved'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
      <StudentFooter />
    </main>
  )
}

export default Dashboard

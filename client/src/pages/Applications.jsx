import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ApplicationCard from '../components/ApplicationCard'
import StudentFooter from '../components/StudentFooter'

const API_URL = import.meta.env.VITE_API_URL || ''

function Applications({ onLogout }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [updatingApplicationId, setUpdatingApplicationId] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')

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

  const handleStatusChange = async (applicationId, newStatus) => {
    const application = applications.find((item) => item._id === applicationId)

    if (!application) {
      return
    }

    setError('')
    setSuccessMessage('')
    setUpdatingApplicationId(applicationId)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: application.companyName,
          jobTitle: application.jobTitle,
          jobUrl: application.jobUrl,
          applicationDate: application.applicationDate,
          source: application.source,
          status: newStatus,
          notes: application.notes,
        }),
      })

      const updatedApplication = await response.json()

      if (!response.ok) {
        throw new Error(updatedApplication.message || 'Could not update status.')
      }

      setApplications(applications.map((item) => (
        item._id === applicationId ? updatedApplication : item
      )))
      setSuccessMessage(`Application status changed to ${newStatus}.`)
    } catch (err) {
      setError(err.message || 'Cannot connect to the server.')
    } finally {
      setUpdatingApplicationId('')
    }
  }

  const filteredApplications = applications
    .filter((application) => {
      const searchText = search.toLowerCase()
      const companyMatches = application.companyName.toLowerCase().includes(searchText)
      const titleMatches = application.jobTitle.toLowerCase().includes(searchText)
      const statusMatches = statusFilter === 'All' || application.status === statusFilter
      const sourceMatches = sourceFilter === 'All' || application.source === sourceFilter

      return (companyMatches || titleMatches) && statusMatches && sourceMatches
    })
    .sort((firstApplication, secondApplication) => {
      const firstDate = new Date(firstApplication.createdAt).getTime()
      const secondDate = new Date(secondApplication.createdAt).getTime()

      return sortOrder === 'newest' ? secondDate - firstDate : firstDate - secondDate
    })

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
        {successMessage && <p className="alert success-message">{successMessage}</p>}

        {loading ? (
          <div className="content-state">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="content-state empty-state">
            <h2>No applications yet</h2>
            <p>Add your first job application to start tracking your progress.</p>
            <Link className="primary-link" to="/applications/new">Add your first application</Link>
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <div className="search-field">
                <label htmlFor="applicationSearch">Search</label>
                <input
                  id="applicationSearch"
                  type="search"
                  placeholder="Company or job title"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="statusFilter">Status</label>
                <select id="statusFilter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option>All</option>
                  <option>Saved</option>
                  <option>Applied</option>
                  <option>Assessment</option>
                  <option>Interview</option>
                  <option>Rejected</option>
                  <option>Offer</option>
                </select>
              </div>

              <div>
                <label htmlFor="sourceFilter">Source</label>
                <select id="sourceFilter" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                  <option>All</option>
                  <option>LinkedIn</option>
                  <option>Bdjobs</option>
                  <option>Indeed</option>
                  <option>Wellfound</option>
                  <option>Facebook</option>
                  <option>Referral</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortOrder">Sort by</label>
                <select id="sortOrder" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            <p className="result-count">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>

            {filteredApplications.length === 0 ? (
              <div className="content-state empty-state">
                <h2>No matching applications</h2>
                <p>Try changing your search text or filters.</p>
                <button
                  className="clear-filter-button"
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All')
                    setSourceFilter('All')
                    setSortOrder('newest')
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="application-grid">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application._id}
                    application={application}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    updating={updatingApplicationId === application._id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
      <StudentFooter />
    </main>
  )
}

export default Applications

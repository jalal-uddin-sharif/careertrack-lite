import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function ApplicationDetailsModal({ application, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const formatDate = (date) => {
    if (!date) {
      return 'Not available'
    }

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const closeFromBackground = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={closeFromBackground}>
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <div className="details-modal-header">
          <div>
            <p className="eyebrow">APPLICATION DETAILS</p>
            <h2 id="details-title">{application.jobTitle}</h2>
            <p>{application.companyName}</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close details">
            &times;
          </button>
        </div>

        <div className="details-status-row">
          <StatusBadge status={application.status} />
          <span>Applied on {formatDate(application.applicationDate)}</span>
        </div>

        <div className="details-grid">
          <div>
            <span>Source</span>
            <strong>{application.source}</strong>
          </div>
          <div>
            <span>Created</span>
            <strong>{formatDate(application.createdAt)}</strong>
          </div>
          <div>
            <span>Last updated</span>
            <strong>{formatDate(application.updatedAt)}</strong>
          </div>
        </div>

        <div className="details-notes">
          <h3>Notes</h3>
          <p>{application.notes || 'No notes added for this application.'}</p>
        </div>

        <div className="details-modal-actions">
          {application.jobUrl && (
            <a href={application.jobUrl} target="_blank" rel="noreferrer">Open job post</a>
          )}
          <Link to={`/applications/${application._id}/edit`}>Edit application</Link>
        </div>
      </section>
    </div>
  )
}

export default ApplicationDetailsModal

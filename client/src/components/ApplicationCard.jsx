import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function ApplicationCard({ application, onDelete, onStatusChange, updating }) {
  return (
    <article className="application-card">
      <div className="application-card-top">
        <div>
          <h3>{application.jobTitle}</h3>
          <p>{application.companyName}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="application-info">
        <span><strong>Source:</strong> {application.source}</span>
        <span><strong>Applied:</strong> {application.applicationDate}</span>
      </div>

      {application.notes && <p className="application-notes">{application.notes}</p>}

      <div className="quick-status">
        <label htmlFor={`status-${application._id}`}>Quick status update</label>
        <select
          id={`status-${application._id}`}
          value={application.status}
          onChange={(event) => onStatusChange(application._id, event.target.value)}
          disabled={updating}
        >
          <option>Saved</option>
          <option>Applied</option>
          <option>Assessment</option>
          <option>Interview</option>
          <option>Rejected</option>
          <option>Offer</option>
        </select>
        {updating && <span>Updating...</span>}
      </div>

      <div className="application-actions">
        {application.jobUrl && (
          <a href={application.jobUrl} target="_blank" rel="noreferrer">View job post</a>
        )}
        <Link to={`/applications/${application._id}/edit`}>Edit</Link>
        <button type="button" onClick={() => onDelete(application._id)}>Delete</button>
      </div>
    </article>
  )
}

export default ApplicationCard

const validStatuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Rejected', 'Offer']

function StatusBadge({ status }) {
  const safeStatus = validStatuses.includes(status) ? status : 'Saved'
  const className = `status-badge status-${safeStatus.toLowerCase()}`

  return <span className={className}>{safeStatus}</span>
}

export default StatusBadge

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <span className={`stat-dot ${color}`}></span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  )
}

export default StatCard

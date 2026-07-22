function Dashboard({ user, onLogout }) {
  return (
    <main className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-brand">
          <span className="brand-mark">C</span>
          <span>CareerTrack</span>
        </div>
        <button type="button" onClick={onLogout}>Log out</button>
      </nav>

      <section className="dashboard-welcome">
        <p className="eyebrow">DASHBOARD</p>
        <h1>Welcome to CareerTrack</h1>
        <p>You are logged in as {user.email}.</p>
        <div className="dashboard-note">
          Your application dashboard will be added in the next step.
        </div>
      </section>
    </main>
  )
}

export default Dashboard

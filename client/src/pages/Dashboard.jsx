import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Dashboard({ user, onLogout }) {
  return (
    <main className="dashboard-page">
      <Navbar onLogout={onLogout} />

      <section className="dashboard-welcome">
        <p className="eyebrow">DASHBOARD</p>
        <h1>Welcome to CareerTrack</h1>
        <p>You are logged in as {user.email}.</p>
        <div className="dashboard-note">
          <p>Your account is ready. Add an application to start tracking your job search.</p>
          <Link className="primary-link" to="/applications/new">Add application</Link>
        </div>
      </section>
    </main>
  )
}

export default Dashboard

import { NavLink } from 'react-router-dom'

function Navbar({ onLogout }) {
  return (
    <nav className="dashboard-nav">
      <NavLink className="dashboard-brand" to="/dashboard">
        <span className="brand-mark">C</span>
        <span>CareerTrack</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/applications">Applications</NavLink>
        <NavLink className="add-nav-link" to="/applications/new">Add new</NavLink>
        <button type="button" onClick={onLogout}>Log out</button>
      </div>
    </nav>
  )
}

export default Navbar

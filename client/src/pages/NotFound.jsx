import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found-page">
      <div>
        <p className="eyebrow">404 ERROR</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link className="primary-link" to="/dashboard">Go to dashboard</Link>
      </div>
    </main>
  )
}

export default NotFound

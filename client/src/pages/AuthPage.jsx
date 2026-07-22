import { useState } from 'react'
import AuthSidePanel from '../components/AuthSidePanel'
import Login from '../components/Login'
import Register from '../components/Register'

function AuthPage({ startPage, onLogin }) {
  const [page, setPage] = useState(startPage)

  return (
    <main className="auth-page">
      <AuthSidePanel />

      <section className="form-section">
        <div className="mobile-brand">
          <span className="brand-mark">C</span>
          <span>CareerTrack</span>
        </div>

        {page === 'login' ? (
          <Login changePage={setPage} onLogin={onLogin} />
        ) : (
          <Register changePage={setPage} onLogin={onLogin} />
        )}

        <p className="copyright">&copy; 2026 CareerTrack Lite</p>
      </section>
    </main>
  )
}

export default AuthPage

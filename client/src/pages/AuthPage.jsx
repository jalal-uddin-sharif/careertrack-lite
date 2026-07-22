import { useState } from 'react'
import AuthSidePanel from '../components/AuthSidePanel'
import Login from '../components/Login'
import Register from '../components/Register'
import StudentFooter from '../components/StudentFooter'

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

        <StudentFooter />
      </section>
    </main>
  )
}

export default AuthPage

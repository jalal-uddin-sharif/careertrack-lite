import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [page, setPage] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const changePage = (newPage) => {
    setPage(newPage)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMessage('')
    setError('')
    setShowPassword(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (page === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (page === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/${page}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        email: data.email,
      }))

      if (page === 'register') {
        setMessage('Account created successfully. You are now logged in.')
      } else {
        setMessage('Login successful. Welcome back!')
      }

      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Cannot connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="intro-section">
        <div className="brand">
          <span className="brand-mark">C</span>
          <span>CareerTrack</span>
        </div>

        <div className="intro-content">
          <span className="small-label">YOUR CAREER, ORGANIZED</span>
          <h1>Turn every application into an opportunity.</h1>
          <p>
            Keep your job search in one simple place. Track applications,
            follow your progress, and stay ready for the next interview.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Track every job application</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Stay updated with clear statuses</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>View your progress at a glance</span>
            </div>
          </div>
        </div>

        <p className="intro-footer">Simple tools for a smarter job search.</p>
      </section>

      <section className="form-section">
        <div className="mobile-brand">
          <span className="brand-mark">C</span>
          <span>CareerTrack</span>
        </div>

        <div className="form-box">
          <div className="form-heading">
            <p className="eyebrow">CAREERTRACK LITE</p>
            <h2>{page === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>
              {page === 'login'
                ? 'Enter your details to continue your job search.'
                : 'Start organizing your job applications today.'}
            </p>
          </div>

          <div className="page-switch">
            <button
              className={page === 'login' ? 'active' : ''}
              type="button"
              onClick={() => changePage('login')}
            >
              Log in
            </button>
            <button
              className={page === 'register' ? 'active' : ''}
              type="button"
              onClick={() => changePage('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="password-box">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {page === 'register' && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {error && <p className="alert error-message">{error}</p>}
            {message && <p className="alert success-message">{message}</p>}

            <button className="submit-button" type="submit" disabled={loading}>
              {loading
                ? 'Please wait...'
                : page === 'login'
                  ? 'Log in to CareerTrack'
                  : 'Create account'}
            </button>
          </form>

          <p className="bottom-text">
            {page === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => changePage(page === 'login' ? 'register' : 'login')}
            >
              {page === 'login' ? 'Register now' : 'Log in'}
            </button>
          </p>
        </div>

        <p className="copyright">© 2026 CareerTrack Lite</p>
      </section>
    </main>
  )
}

export default App

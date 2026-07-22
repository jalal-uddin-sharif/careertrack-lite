import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function Login({ changePage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        email: data.email,
      }))

      setMessage('Login successful. Welcome back!')
      setPassword('')
    } catch (err) {
      setError(err.message || 'Cannot connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-box">
      <div className="form-heading">
        <p className="eyebrow">CAREERTRACK LITE</p>
        <h2>Welcome back</h2>
        <p>Enter your details to continue your job search.</p>
      </div>

      <div className="page-switch">
        <button className="active" type="button">Log in</button>
        <button type="button" onClick={() => changePage('register')}>Register</button>
      </div>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="loginEmail">Email address</label>
          <input
            id="loginEmail"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="loginPassword">Password</label>
          <div className="password-box">
            <input
              id="loginPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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

        {error && <p className="alert error-message">{error}</p>}
        {message && <p className="alert success-message">{message}</p>}

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Log in to CareerTrack'}
        </button>
      </form>

      <p className="bottom-text">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={() => changePage('register')}>
          Register now
        </button>
      </p>
    </div>
  )
}

export default Login

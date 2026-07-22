import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function Register({ changePage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        email: data.email,
      }))

      setMessage('Account created successfully. You are now logged in.')
      setPassword('')
      setConfirmPassword('')
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
        <h2>Create your account</h2>
        <p>Start organizing your job applications today.</p>
      </div>

      <div className="page-switch">
        <button type="button" onClick={() => changePage('login')}>Log in</button>
        <button className="active" type="button">Register</button>
      </div>

      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label htmlFor="registerEmail">Email address</label>
          <input
            id="registerEmail"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="registerPassword">Password</label>
          <div className="password-box">
            <input
              id="registerPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        {error && <p className="alert error-message">{error}</p>}
        {message && <p className="alert success-message">{message}</p>}

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : 'Create account'}
        </button>
      </form>

      <p className="bottom-text">
        Already have an account?{' '}
        <button type="button" onClick={() => changePage('login')}>
          Log in
        </button>
      </p>
    </div>
  )
}

export default Register

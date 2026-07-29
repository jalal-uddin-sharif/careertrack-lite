import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import StudentFooter from '../components/StudentFooter'

const API_URL = import.meta.env.VITE_API_URL || ''

function Settings({ onLogout }) {
  const [scriptCode, setScriptCode] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/google-sheet`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message)

        setScriptCode(data.scriptCode)
        setWebhookUrl(data.webhookUrl)
        setConfigured(data.configured)
      } catch (err) {
        setError(err.message || 'Could not load settings.')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode)
      setMessage('Apps Script code copied.')
      setError('')
    } catch {
      setError('Could not copy automatically. Select the code and copy it manually.')
    }
  }

  const saveConnection = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/settings/google-sheet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ webhookUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setConfigured(true)
      setMessage('Google Sheet connection saved successfully.')
    } catch (err) {
      setError(err.message || 'Could not save the connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar onLogout={onLogout} />
      <section className="content-container dashboard-content settings-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">SETTINGS</p>
            <h1>Google Sheet sync</h1>
            <p>Connect once, then every new application will be added to your sheet.</p>
          </div>
          <span className={`connection-status ${configured ? 'connected' : ''}`}>
            {configured ? 'Connected' : 'Not connected'}
          </span>
        </div>

        {loading ? <div className="content-state">Loading settings...</div> : (
          <div className="settings-grid">
            <section className="settings-card">
              <span className="settings-step">Step 1</span>
              <h2>Copy the code</h2>
              <p>Open your Google Sheet, then go to <strong>Extensions → Apps Script</strong>. Delete the old code and paste this code.</p>
              <textarea className="script-code" value={scriptCode} readOnly rows="14" aria-label="Google Apps Script code" />
              <button className="copy-code-button" type="button" onClick={copyCode}>Copy code</button>
            </section>

            <section className="settings-card">
              <span className="settings-step">Step 2</span>
              <h2>Deploy the script</h2>
              <ol>
                <li>Click <strong>Deploy → New deployment</strong>.</li>
                <li>Select type: <strong>Web app</strong>.</li>
                <li>Execute as: <strong>Me</strong>.</li>
                <li>Who has access: <strong>Anyone</strong>.</li>
                <li>Click Deploy and copy the Web App URL.</li>
              </ol>

              <form className="sheet-link-form" onSubmit={saveConnection}>
                <label htmlFor="webhookUrl">Apps Script Web App URL</label>
                <input
                  id="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  required
                />
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save connection'}
                </button>
              </form>
            </section>
          </div>
        )}

        {message && <p className="alert success-message">{message}</p>}
        {error && <p className="alert error-message">{error}</p>}
      </section>
      <StudentFooter />
    </main>
  )
}

export default Settings

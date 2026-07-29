import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
const emptyGoal = { statement: '', targetNumber: 1, progress: 0, blockers: '', status: 'Not started' }

function WeeklyGoals() {
  const [goals, setGoals] = useState([{ ...emptyGoal }, { ...emptyGoal }, { ...emptyGoal }])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/career/goals`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        const data = await response.json()
        if (response.ok && data.length) {
          setGoals([0, 1, 2].map((index) => data[index] || { ...emptyGoal }))
        }
      } catch {
        setMessage('Could not load weekly goals.')
      }
    }
    loadGoals()
  }, [])

  const updateGoal = (index, field, value) => {
    const updatedGoals = [...goals]
    updatedGoals[index] = { ...updatedGoals[index], [field]: value }
    setGoals(updatedGoals)
  }

  const saveGoals = async (event) => {
    event.preventDefault()
    setMessage('Saving...')
    try {
      const response = await fetch(`${API_URL}/api/career/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ goals }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setMessage('Weekly goals saved.')
    } catch (error) {
      setMessage(error.message || 'Could not save weekly goals.')
    }
  }

  return (
    <form className="assistant-panel" onSubmit={saveGoals}>
      <div className="section-heading">
        <div><h2>Weekly goals</h2><p>Keep the plan focused with a maximum of three goals.</p></div>
      </div>
      <div className="goal-grid">
        {goals.map((goal, index) => (
          <div className="goal-card" key={index}>
            <span className="goal-number">Goal {index + 1}</span>
            <label>Goal statement<input value={goal.statement} onChange={(event) => updateGoal(index, 'statement', event.target.value)} placeholder={index === 0 ? 'Example: Submit targeted applications' : 'Optional goal'} /></label>
            <div className="goal-numbers">
              <label>Target<input type="number" min="0" value={goal.targetNumber} onChange={(event) => updateGoal(index, 'targetNumber', event.target.value)} /></label>
              <label>Progress<input type="number" min="0" value={goal.progress} onChange={(event) => updateGoal(index, 'progress', event.target.value)} /></label>
            </div>
            <label>Status
              <select value={goal.status} onChange={(event) => updateGoal(index, 'status', event.target.value)}>
                <option>Not started</option><option>In progress</option><option>Completed</option>
              </select>
            </label>
            <label>Blockers<textarea rows="3" value={goal.blockers} onChange={(event) => updateGoal(index, 'blockers', event.target.value)} /></label>
          </div>
        ))}
      </div>
      {message && <p className="assistant-message">{message}</p>}
      <button className="primary-button" type="submit">Save weekly goals</button>
    </form>
  )
}

export default WeeklyGoals

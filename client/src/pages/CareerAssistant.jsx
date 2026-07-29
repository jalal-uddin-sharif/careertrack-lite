import { useState } from 'react'
import CareerProfileForm from '../components/CareerProfileForm'
import JdScanner from '../components/JdScanner'
import Navbar from '../components/Navbar'
import StudentFooter from '../components/StudentFooter'
import WeeklyGoals from '../components/WeeklyGoals'

function CareerAssistant({ onLogout }) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <main className="dashboard-page">
      <Navbar onLogout={onLogout} />
      <section className="content-container dashboard-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">CAREER ASSISTANT</p>
            <h1>Plan your next move</h1>
            <p>Build your profile, check role fit, and keep weekly goals on track.</p>
          </div>
        </div>

        <div className="assistant-tabs" role="tablist">
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Student profile</button>
          <button className={activeTab === 'scan' ? 'active' : ''} onClick={() => setActiveTab('scan')}>JD scan</button>
          <button className={activeTab === 'goals' ? 'active' : ''} onClick={() => setActiveTab('goals')}>Weekly goals</button>
        </div>

        {activeTab === 'profile' && <CareerProfileForm />}
        {activeTab === 'scan' && <JdScanner />}
        {activeTab === 'goals' && <WeeklyGoals />}
      </section>
      <StudentFooter />
    </main>
  )
}

export default CareerAssistant

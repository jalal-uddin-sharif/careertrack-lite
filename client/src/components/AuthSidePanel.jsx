function AuthSidePanel() {
  return (
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
            <span className="feature-icon">&#10003;</span>
            <span>Track every job application</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">&#10003;</span>
            <span>Stay updated with clear statuses</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">&#10003;</span>
            <span>View your progress at a glance</span>
          </div>
        </div>
      </div>

      <p className="intro-footer">Simple tools for a smarter job search.</p>
    </section>
  )
}

export default AuthSidePanel

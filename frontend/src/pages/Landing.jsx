import { Link } from 'react-router-dom'
import { Scale, FileText, Gavel, Shield, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'

const features = [
  {
    icon: '📄',
    color: '#6171f3',
    title: 'Document Intelligence',
    description: 'Upload rental agreements, loan contracts, or employment offers. Our AI flags risky clauses and explains everything in plain English.',
  },
  {
    icon: '✍️',
    color: '#f59e0b',
    title: 'Complaint Drafter',
    description: 'Describe your issue in simple language. Get a professionally drafted formal complaint with the right authority to file it with.',
  },
  {
    icon: '🛡️',
    color: '#22c55e',
    title: 'Scam Detector',
    description: 'Paste a suspicious job offer, loan message, or investment pitch. Get instant risk analysis with red flag explanations.',
  },
  {
    icon: '💬',
    color: '#a78bfa',
    title: 'Legal RAG Chatbot',
    description: 'Ask legal questions in plain English. Get cited answers grounded in actual Indian consumer, tenant, and labor law.',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-bg" />

        <div className="landing-badge">
          <Sparkles size={14} />
          AI-Powered Legal Platform for Every Indian Citizen
        </div>

        <h1 className="landing-title">
          Your AI Legal Assistant,<br />
          <span className="gradient-text">Available 24/7</span>
        </h1>

        <p className="landing-description">
          Understand legal documents, draft complaints, detect scams, and ask legal questions —
          all in plain English. No lawyers needed for everyday issues.
        </p>

        <div className="landing-actions">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Floating cards preview */}
        <div style={{ marginTop: 64, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Document Analysis', 'Complaint Drafter', 'Scam Detector', 'Legal Chat'].map((label, i) => (
            <div key={label} className="card" style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', animationDelay: `${i * 0.1}s` }}>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Four powerful AI modules that cover the most common legal pain points faced by citizens.
          </p>
        </div>

        <div className="features-grid">
          {features.map(({ icon, color, title, description }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon" style={{ background: `${color}20` }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-description">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 32px' }}>
        <h2 style={{ marginBottom: 16 }}>Ready to Get Started?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          Free to use. No credit card required.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { scamApi } from '../services/api'
import RiskBadge from '../components/RiskBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const CHECK_TYPES = [
  { value: 'auto', label: '🔍 Auto-detect' },
  { value: 'job_offer', label: '💼 Job Offer' },
  { value: 'loan_offer', label: '💳 Loan Offer' },
  { value: 'investment', label: '📈 Investment Scheme' },
  { value: 'message', label: '📩 Suspicious Message' },
  { value: 'other', label: '🔎 Other' },
]

function ScamResultCard({ check }) {
  const [expanded, setExpanded] = useState(false)
  const riskPercent = check.risk_score || 0
  const riskFillClass = {
    SAFE: 'risk-fill-safe', LOW: 'risk-fill-low', MEDIUM: 'risk-fill-medium',
    HIGH: 'risk-fill-high', CRITICAL: 'risk-fill-critical',
  }[check.risk_level] || 'risk-fill-medium'

  const severityClass = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', CRITICAL: 'badge-critical' }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <RiskBadge level={check.risk_level} score={check.risk_score} />
            <span className="badge badge-blue">{check.check_type}</span>
            <span className="text-sm text-muted">{new Date(check.created_at).toLocaleDateString()}</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500 }}>
            {check.verdict}
          </p>
        </div>
        <button className="btn-icon" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      <div className="risk-meter" style={{ marginBottom: expanded ? 16 : 0 }}>
        <div className={`risk-meter-fill ${riskFillClass}`} style={{ width: `${riskPercent}%` }} />
      </div>

      {expanded && (
        <div className="animate-fade-in" style={{ marginTop: 16 }}>
          {/* Input preview */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16,
            border: '1px solid var(--border-default)', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            "{check.input_text.slice(0, 300)}{check.input_text.length > 300 ? '...' : ''}"
          </div>

          {check.red_flags?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, marginBottom: 10, color: 'var(--danger-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} /> Red Flags ({check.red_flags.length})
              </h4>
              {check.red_flags.map((f, i) => (
                <div key={i} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.flag}</span>
                    <span className={`badge ${severityClass[f.severity] || 'badge-medium'}`}>{f.severity}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {check.safe_signals?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, marginBottom: 10, color: 'var(--success-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> Safe Signals
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {check.safe_signals.map((s, i) => (
                  <span key={i} className="badge badge-safe">{s}</span>
                ))}
              </div>
            </div>
          )}

          {check.recommendation && (
            <div style={{ background: 'rgba(97,113,243,0.08)', border: '1px solid rgba(97,113,243,0.2)',
              borderRadius: 'var(--radius-md)', padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-300)', marginBottom: 4 }}>Recommendation</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{check.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScamDetector() {
  const [form, setForm] = useState({ input_text: '', check_type: 'auto' })
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)

  useEffect(() => {
    scamApi.history()
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await scamApi.analyze(form)
      setHistory(prev => [data, ...prev])
      setForm({ input_text: '', check_type: 'auto' })
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🛡️ Scam Detector</h1>
        <p className="page-subtitle">
          Paste any suspicious job offer, loan message, investment pitch, or text.
          Our AI will analyze it for fraud indicators and give you a detailed risk assessment.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Type of Content</label>
            <select id="scam-type" className="form-select" value={form.check_type}
              onChange={e => setForm({ ...form, check_type: e.target.value })}>
              {CHECK_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Paste the Text to Analyze</label>
            <textarea
              id="scam-input"
              className="form-textarea"
              style={{ minHeight: 160 }}
              placeholder={'Example:\n"URGENT: You have been selected for a Work From Home job. Salary ₹50,000/month. No experience needed. Pay ₹2,000 registration fee to start immediately. Limited slots available. Call now: 9876543210"'}
              value={form.input_text}
              onChange={e => setForm({ ...form, input_text: e.target.value })}
              required
            />
          </div>

          <button id="scam-submit" type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" /> Analyzing...</> : <><Shield size={16} /> Analyze for Scam</>}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: 16 }}>Previous Checks</h3>
      {histLoading ? <LoadingSpinner /> : history.length === 0 ? (
        <div className="empty-state">
          <Shield size={40} style={{ opacity: 0.2 }} />
          <p>No scam checks yet. Paste suspicious content above.</p>
        </div>
      ) : (
        history.map(c => <ScamResultCard key={c.id} check={c} />)
      )}
    </div>
  )
}

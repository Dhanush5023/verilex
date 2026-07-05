import { useState, useEffect } from 'react'
import { Gavel, Copy, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { complaintsApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = [
  { value: '', label: 'Auto-detect category' },
  { value: 'consumer', label: '🛒 Consumer / E-commerce' },
  { value: 'tenant', label: '🏠 Tenant / Rental' },
  { value: 'employment', label: '💼 Employment' },
  { value: 'digital_fraud', label: '💻 Digital Fraud' },
  { value: 'banking', label: '🏦 Banking / Finance' },
  { value: 'telecom', label: '📱 Telecom' },
  { value: 'government', label: '🏛️ Government Service' },
]

function ComplaintCard({ complaint }) {
  const [expanded, setExpanded] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(complaint.formal_complaint)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h4 style={{ fontSize: 16, marginBottom: 4 }}>{complaint.complaint_title || 'Formal Complaint'}</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-blue">{complaint.category}</span>
            <span className="text-sm text-muted">{new Date(complaint.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-icon" onClick={copyToClipboard} title="Copy complaint">
            <Copy size={15} />
          </button>
          <button className="btn-icon" onClick={() => setExpanded(!expanded)} title="Toggle">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in">
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 14,
            border: '1px solid var(--border-default)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {complaint.formal_complaint}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {complaint.filing_authority && (
              <div>
                <p className="form-label" style={{ marginBottom: 4 }}>File With</p>
                <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{complaint.filing_authority}</p>
              </div>
            )}
            {complaint.filing_portal && (
              <div>
                <p className="form-label" style={{ marginBottom: 4 }}>Portal / Office</p>
                <a href={complaint.filing_portal.startsWith('http') ? complaint.filing_portal : '#'}
                  target="_blank" rel="noreferrer" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {complaint.filing_portal} <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>

          {complaint.legal_references?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p className="form-label" style={{ marginBottom: 8 }}>Legal References</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {complaint.legal_references.map((ref, i) => (
                  <span key={i} className="badge badge-medium">{ref}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ComplaintDrafter() {
  const [form, setForm] = useState({ issue_description: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)

  useEffect(() => {
    complaintsApi.list()
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.issue_description.trim().length < 20) {
      toast.error('Please describe your issue in more detail (at least 20 characters).')
      return
    }
    setLoading(true)
    try {
      const { data } = await complaintsApi.draft({
        issue_description: form.issue_description,
        category: form.category || null,
      })
      setHistory(prev => [data, ...prev])
      setForm({ issue_description: '', category: '' })
      toast.success('Complaint drafted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to draft complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">✍️ Complaint Drafter</h1>
        <p className="page-subtitle">
          Describe your issue in simple language. Our AI will draft a professionally worded formal complaint
          with the correct authority and legal references.
        </p>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Category (Optional)</label>
            <select id="complaint-category" className="form-select" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Describe Your Issue</label>
            <textarea
              id="complaint-description"
              className="form-textarea"
              style={{ minHeight: 150 }}
              placeholder="Example: I ordered a laptop from Amazon worth ₹45,000 on June 15th. It arrived damaged. I requested a refund on June 18th but they rejected it saying the damage was 'user-caused' which is false. The laptop had internal damage from shipping. I've emailed them 3 times with no resolution..."
              value={form.issue_description}
              onChange={e => setForm({ ...form, issue_description: e.target.value })}
              required
            />
            <p className="text-sm text-muted">Be specific: include dates, amounts, company names, and what you tried.</p>
          </div>

          <button id="complaint-submit" type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" /> Drafting complaint...</> : <><Gavel size={16} /> Draft Formal Complaint</>}
          </button>
        </form>
      </div>

      {/* History */}
      <h3 style={{ marginBottom: 16 }}>Your Complaints</h3>
      {histLoading ? <LoadingSpinner /> : history.length === 0 ? (
        <div className="empty-state">
          <Gavel size={40} style={{ opacity: 0.2 }} />
          <p>No complaints drafted yet.</p>
        </div>
      ) : (
        history.map(c => <ComplaintCard key={c.id} complaint={c} />)
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Upload, FileText, Trash2, RefreshCw, AlertTriangle, 
  CheckCircle, MessageSquare, ArrowLeft, Sparkles, Download, Copy, ShieldAlert 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { documentsApi, chatApi, agentApi, API_BASE_URL } from '../services/api'
import RiskBadge, { StatusBadge } from '../components/RiskBadge'
import LoadingSpinner from '../components/LoadingSpinner'

// ─── Upload View ────────────────────────────────────────────────────────────
function UploadView({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await documentsApi.upload(fd)
      toast.success('Document uploaded! Analysis starting...')
      onUploadSuccess(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📄 Document Intelligence</h1>
        <p className="page-subtitle">Upload legal documents to get AI-powered analysis, risk scoring, and plain-English explanations.</p>
      </div>

      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        {uploading ? (
          <LoadingSpinner text="Uploading and starting analysis..." />
        ) : (
          <>
            <div className="upload-zone-icon">
              <Upload size={26} />
            </div>
            <p className="upload-zone-text">Drop your document here or click to browse</p>
            <p className="upload-zone-hint">Supports PDF, DOCX, TXT, PNG, JPG — up to 50MB</p>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-blue">Rental Agreements</span>{' '}
              <span className="badge badge-blue">Loan Contracts</span>{' '}
              <span className="badge badge-blue">Employment Offers</span>{' '}
              <span className="badge badge-blue">Insurance Policies</span>
            </div>
          </>
        )}
        <input id="file-input" type="file" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.tiff" hidden
          onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
      </div>
    </div>
  )
}

// ─── Document List View ──────────────────────────────────────────────────────
function DocumentList({ docs, onDelete, onSelect }) {
  if (docs.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} style={{ opacity: 0.2 }} />
        <p>No documents yet. Upload your first document above.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
      {docs.map(doc => (
        <div key={doc.id} className="card-elevated" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }}
          onClick={() => onSelect(doc.id)}>
          <FileText size={22} style={{ color: 'var(--brand-400)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {doc.original_filename}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={doc.status} />
              {doc.risk_level && <RiskBadge level={doc.risk_level} score={doc.risk_score} />}
              <span className="text-sm text-muted">{doc.document_type || 'document'}</span>
              <span className="text-sm text-muted">{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button className="btn-icon" onClick={e => { e.stopPropagation(); onDelete(doc.id) }}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Document Detail View ────────────────────────────────────────────────────
function DocumentDetail({ docId, onBack }) {
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [runningAgent, setRunningAgent] = useState(false)
  const navigate = useNavigate()

  const fetchDoc = useCallback(async () => {
    try {
      const { data } = await documentsApi.get(docId)
      setDoc(data)
    } catch (e) {
      toast.error('Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [docId])

  useEffect(() => {
    fetchDoc()
    const interval = setInterval(() => {
      if (doc?.status === 'processing' || doc?.status === 'uploaded') fetchDoc()
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchDoc, doc?.status])

  const startChat = async () => {
    try {
      const { data } = await chatApi.createSession('document', docId)
      navigate(`/chat/${data.id}`)
    } catch {
      toast.error('Could not start chat')
    }
  }

  const handleRunAgent = async () => {
    setRunningAgent(true)
    const loadToast = toast.loading("AI Agent auditing document and cross-referencing Indian RAG law base...")
    try {
      const { data } = await agentApi.run(docId)
      setDoc(prev => ({
        ...prev,
        agent_report: data
      }))
      toast.success("Autonomous Legal Agent Audit Completed!", { id: loadToast })
    } catch (err) {
      toast.error(err.response?.data?.detail || "AI Agent audit failed", { id: loadToast })
    } finally {
      setRunningAgent(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/agent/download/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `VeriLex_Audit_Report_${docId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      toast.success("PDF Downloaded successfully!")
    } catch {
      toast.error('Failed to download report PDF')
    }
  }

  const handleCopyComplaint = (text) => {
    navigator.clipboard.writeText(text)
    toast.success("Complaint letter copied to clipboard!")
  }

  if (loading) return <LoadingSpinner />
  if (!doc) return null

  const riskPercent = doc.risk_score ? (doc.risk_score / 10) * 100 : 0
  const riskFillClass = {
    LOW: 'risk-fill-low', MEDIUM: 'risk-fill-medium',
    HIGH: 'risk-fill-high', CRITICAL: 'risk-fill-critical', SAFE: 'risk-fill-safe'
  }[doc.risk_level] || 'risk-fill-medium'

  const agentReport = doc.agent_report

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <h2 style={{ flex: 1, fontSize: 18, margin: 0 }}>{doc.original_filename}</h2>
        <StatusBadge status={doc.status} />
        {doc.status === 'processing' && <RefreshCw size={16} className="animate-pulse" style={{ color: 'var(--warning-400)' }} />}
        {doc.status === 'ready' && (
          <button className="btn btn-secondary btn-sm" onClick={startChat}>
            <MessageSquare size={14} /> Chat about this doc
          </button>
        )}
      </div>

      {doc.status === 'processing' || doc.status === 'uploaded' ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Analyzing document with AI... This may take up to 30 seconds.</p>
        </div>
      ) : doc.status === 'error' ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <AlertTriangle size={40} style={{ color: 'var(--danger-400)', margin: '0 auto 12px' }} />
          <p>Analysis failed. The document may be corrupted or unreadable.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Basic Clause & Risk Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Risk Overview */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>Risk Assessment</h3>
                <RiskBadge level={doc.risk_level} score={doc.risk_score} />
              </div>
              <div className="risk-meter" style={{ marginBottom: 12 }}>
                <div className={`risk-meter-fill ${riskFillClass}`} style={{ width: `${riskPercent}%` }} />
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{doc.summary}</p>
            </div>

            {/* Key Terms */}
            {doc.key_terms?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 14 }}>Key Terms</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {doc.key_terms.map((t, i) => (
                    <span key={i} className="badge badge-blue">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged Clauses */}
            {doc.flagged_clauses?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 14 }}>
                  <AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--warning-400)' }} />
                  Flagged Clauses ({doc.flagged_clauses.length})
                </h3>
                {doc.flagged_clauses.map((c, i) => (
                  <div key={i} className={`clause-card severity-${c.severity?.toLowerCase()}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className={`badge badge-${c.severity?.toLowerCase() === 'high' ? 'high' : c.severity?.toLowerCase() === 'medium' ? 'medium' : 'low'}`}>
                        {c.severity}
                      </span>
                    </div>
                    <p className="clause-text">"{c.clause}"</p>
                    <p className="clause-reason">⚠️ {c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {doc.flagged_clauses?.length === 0 && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={24} style={{ color: 'var(--success-400)', flexShrink: 0 }} />
                <p style={{ color: 'var(--text-secondary)' }}>No risky clauses detected. This document appears to be standard.</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AI Autonomous Agent */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {agentReport ? (
              <div className="card" style={{ border: '1px solid rgba(59, 130, 246, 0.3)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} style={{ color: 'var(--brand-accent)' }} /> 
                    AI Legal Agent Audit
                  </h3>
                  <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF}>
                    <Download size={14} /> Download PDF
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Summary */}
                  <div>
                    <p className="form-label" style={{ marginBottom: 4 }}>Agent Summary</p>
                    <p style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>{agentReport.summary}</p>
                  </div>

                  {/* Actions */}
                  <div>
                    <p className="form-label" style={{ marginBottom: 8 }}>Recommended Actions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {agentReport.recommended_actions?.map((act, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)' }}>
                          <span>👉</span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Laws RAG */}
                  <div>
                    <p className="form-label" style={{ marginBottom: 8 }}>Linked Indian Legislation (RAG)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {agentReport.relevant_laws?.map((law, i) => (
                        <div key={i} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                          <p style={{ fontSize: 12.5, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
                            {law.act} - {law.section}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{law.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pre-Drafted Complaint Card */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p className="form-label">Auto-Drafted Dispute Letter</p>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '3px 8px' }} onClick={() => handleCopyComplaint(agentReport.complaint_template)}>
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <pre style={{ 
                      background: 'var(--bg-base)', border: '1px solid var(--border-default)', 
                      padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace'
                    }}>
                      {agentReport.complaint_template}
                    </pre>
                  </div>
                  
                  {/* Re-run button */}
                  <button className="btn btn-secondary btn-sm" onClick={handleRunAgent} disabled={runningAgent} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                    {runningAgent ? <RefreshCw size={14} className="animate-pulse" /> : <RefreshCw size={14} />} Re-run Audit
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed var(--border-strong)' }}>
                <ShieldAlert size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                <h3 style={{ marginBottom: 8 }}>Activate AI Legal Agent</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
                  Run an autonomous legal audit. The agent will cross-reference this document with the Indian Civil Law knowledge base, extract applicable acts/sections, outline specific action items, and generate a downloadable PDF report.
                </p>
                <button className="btn btn-primary" onClick={handleRunAgent} disabled={runningAgent}>
                  {runningAgent ? (
                    <><div className="spinner spinner-sm" /> Running Audit...</>
                  ) : (
                    <><Sparkles size={16} /> Run Agent Audit</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DocumentAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [listLoading, setListLoading] = useState(true)

  const fetchDocs = useCallback(async () => {
    try {
      const { data } = await documentsApi.list()
      setDocs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleDelete = async (docId) => {
    try {
      await documentsApi.delete(docId)
      setDocs(prev => prev.filter(d => d.id !== docId))
      toast.success('Document deleted')
      if (id == docId) navigate('/documents')
    } catch {
      toast.error('Delete failed')
    }
  }

  if (id) {
    return (
      <div className="page-container">
        <DocumentDetail docId={parseInt(id)} onBack={() => navigate('/documents')} />
      </div>
    )
  }

  return (
    <div className="page-container">
      <UploadView onUploadSuccess={(doc) => {
        setDocs(prev => [doc, ...prev])
        navigate(`/documents/${doc.id}`)
      }} />
      {listLoading ? <LoadingSpinner text="Loading documents..." /> : (
        <DocumentList docs={docs} onDelete={handleDelete} onSelect={(id) => navigate(`/documents/${id}`)} />
      )}
    </div>
  )
}

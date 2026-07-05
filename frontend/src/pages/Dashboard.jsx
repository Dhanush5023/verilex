import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Gavel, Shield, MessageSquare, ArrowRight, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { documentsApi, complaintsApi, scamApi, chatApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ docs: 0, complaints: 0, scans: 0, chats: 0 })
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, complaints, scam, chat] = await Promise.allSettled([
          documentsApi.list(),
          complaintsApi.list(),
          scamApi.history(),
          chatApi.listSessions(),
        ])
        const docsData = docs.status === 'fulfilled' ? docs.value.data : []
        setStats({
          docs: docsData.length,
          complaints: complaints.status === 'fulfilled' ? complaints.value.data.length : 0,
          scans: scam.status === 'fulfilled' ? scam.value.data.length : 0,
          chats: chat.status === 'fulfilled' ? chat.value.data.length : 0,
        })
        setRecentDocs(docsData.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <LoadingSpinner text="Loading dashboard..." />

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{greeting}, {user?.full_name?.split(' ')[0] || user?.username} 👋</h1>
        <p className="page-subtitle">Here's an overview of your VeriLex activity.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <FileText size={40} className="stat-icon" />
          <div className="stat-value">{stats.docs}</div>
          <div className="stat-label">Documents Analyzed</div>
        </div>
        <div className="stat-card gold">
          <Gavel size={40} className="stat-icon" />
          <div className="stat-value">{stats.complaints}</div>
          <div className="stat-label">Complaints Drafted</div>
        </div>
        <div className="stat-card green">
          <Shield size={40} className="stat-icon" />
          <div className="stat-value">{stats.scans}</div>
          <div className="stat-label">Scam Checks</div>
        </div>
        <div className="stat-card purple">
          <MessageSquare size={40} className="stat-icon" />
          <div className="stat-value">{stats.chats}</div>
          <div className="stat-label">Chat Sessions</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 20 }}>Quick Actions</h3>
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[
            { to: '/documents', icon: '📄', label: 'Analyze Document', color: '#6171f3' },
            { to: '/complaint', icon: '✍️', label: 'Draft Complaint', color: '#f59e0b' },
            { to: '/scam', icon: '🛡️', label: 'Check for Scam', color: '#22c55e' },
            { to: '/chat', icon: '💬', label: 'Ask Legal Question', color: '#a78bfa' },
          ].map(({ to, icon, label, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div className="feature-card" style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
                <ArrowRight size={14} style={{ color, marginTop: 8 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      {recentDocs.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3>Recent Documents</h3>
            <Link to="/documents" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentDocs.map(doc => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)', textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={18} style={{ color: 'var(--brand-400)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {doc.original_filename}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {doc.document_type || 'document'} • {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <RiskBadge level={doc.risk_level} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

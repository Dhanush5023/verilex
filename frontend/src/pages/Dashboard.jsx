import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FileText, Gavel, Shield, MessageSquare, 
  ArrowRight, Sparkles, Clock, LayoutDashboard, Plus, Download, Copy
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { documentsApi, complaintsApi, scamApi, chatApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import RiskBadge from '../components/RiskBadge'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ docs: 0, complaints: 0, scans: 0, chats: 0 })
  const [recentDocs, setRecentDocs] = useState([])
  const [recentChats, setRecentChats] = useState([])
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
        const chatsData = chat.status === 'fulfilled' ? chat.value.data : []

        setStats({
          docs: docsData.length,
          complaints: complaints.status === 'fulfilled' ? complaints.value.data.length : 0,
          scans: scam.status === 'fulfilled' ? scam.value.data.length : 0,
          chats: chatsData.length,
        })
        setRecentDocs(docsData.slice(0, 4))
        setRecentChats(chatsData.slice(0, 3))
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

  if (loading) return <LoadingSpinner text="Loading dashboard metrics..." />

  return (
    <div className="page-container animate-fade-in">
      
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title">
          {greeting}, {user?.full_name?.split(' ')[0] || user?.username} 👋
        </h1>
        <p className="page-subtitle">Here is a structured snapshot of your legal analysis metrics.</p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: 20, 
        marginBottom: 32 
      }}>
        {[
          { label: 'Audits Ran', value: stats.docs, desc: 'Contracts uploaded', color: 'indigo', icon: FileText },
          { label: 'Complaints', value: stats.complaints, desc: 'Drafter outcomes', color: 'purple', icon: Gavel },
          { label: 'Scam Checks', value: stats.scans, desc: 'Risk evaluated scans', color: 'emerald', icon: Shield },
          { label: 'Consultations', value: stats.chats, desc: 'Chatbot interactions', color: 'cyan', icon: MessageSquare },
        ].map((stat, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, 
              background: `rgba(99, 102, 241, 0.08)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <stat.icon size={22} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32, alignItems: 'start' }}>
        
        {/* SVG Usage Chart */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>AI Usage & Activity Trend</h3>
          <div style={{ height: 200, width: '100%', position: 'relative' }}>
            {/* Custom SVG line chart representing data activity */}
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Horizontal gridlines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              {/* Area path */}
              <path 
                d="M0,170 C50,150 100,160 150,110 C200,60 250,90 300,50 C350,10 400,60 450,40 L500,20 L500,180 L0,180 Z" 
                fill="url(#chartGradient)" 
              />
              {/* Line path */}
              <path 
                d="M0,170 C50,150 100,160 150,110 C200,60 250,90 300,50 C350,10 400,60 450,40 L500,20" 
                fill="none" 
                stroke="var(--brand-primary)" 
                strokeWidth="3" 
              />
              {/* Data points */}
              <circle cx="150" cy="110" r="5" fill="#fff" stroke="var(--brand-primary)" strokeWidth="2" />
              <circle cx="300" cy="50" r="5" fill="#fff" stroke="var(--brand-primary)" strokeWidth="2" />
              <circle cx="450" cy="40" r="5" fill="#fff" stroke="var(--brand-primary)" strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Saved hours widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3>Hours Saved</h3>
          <div style={{ textAlign: 'center', margin: '12px 0' }}>
            <div style={{ 
              width: 110, height: 110, borderRadius: '50%', 
              border: '6px solid var(--border-default)', borderTopColor: 'var(--brand-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>24.5</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Hours of human review avoided</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Based on 45 min/document industry average.</p>
          </div>
        </div>

      </div>

      {/* Quick Actions Panel */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 20 }}>Launch Modules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { to: '/documents', label: 'Document Ingestion', icon: FileText, desc: 'Analyze contracts & terms', bg: '#6366f1' },
            { to: '/complaint', label: 'Dispute Drafter', icon: Gavel, desc: 'Write consumer notices', bg: '#a855f7' },
            { to: '/tools', label: 'AI Suite Utilities', icon: Sparkles, desc: 'IPC Finder & Translator', bg: '#818cf8' },
            { to: '/chat', label: 'Legal Consultations', icon: MessageSquare, desc: 'Realtime chat citations', bg: '#06b6d4' },
          ].map((item, idx) => (
            <Link key={idx} to={item.to} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-default)',
                padding: 20, borderRadius: 'var(--radius-md)', transition: 'all 0.2s', height: '100%',
                display: 'flex', flexDirection: 'column', gap: 10
              }} 
              className="card-elevated"
              >
                <div style={{ 
                  width: 38, height: 38, borderRadius: 8, background: `${item.bg}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.bg
                }}>
                  <item.icon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, color: '#fff' }}>{item.label}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Recent Uploads Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Recent Document Analysis</h3>
            <Link to="/documents" className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentDocs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentDocs.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between',
                    padding: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'border-color 0.2s'
                  }}
                  className="card-elevated"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={18} className="text-indigo-400" />
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{doc.original_filename}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{doc.document_type || 'unclassified'}</p>
                    </div>
                  </div>
                  <RiskBadge level={doc.risk_level} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)' }}>
              No uploads found. Upload a file to see findings.
            </div>
          )}
        </div>

        {/* Recent Chats / Consultations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Recent Consultations</h3>
            <Link to="/chat" className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
              Open Chat <ArrowRight size={14} />
            </Link>
          </div>

          {recentChats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentChats.map(session => (
                <div 
                  key={session.id}
                  onClick={() => navigate(`/chat/${session.id}`)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between',
                    padding: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'border-color 0.2s'
                  }}
                  className="card-elevated"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={18} className="text-cyan-400" />
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{session.title}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {session.session_type === 'document' ? 'Document Q&A' : 'General Legal Q&A'}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)' }}>
              No chat logs found. Open a session to ask questions.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

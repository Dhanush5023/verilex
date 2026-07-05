import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MessageSquare, Send, Plus, Trash2, Scale, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { chatApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

// ─── Chat Message Bubble ────────────────────────────────────────────────────
function ChatMessage({ message, userInitials }) {
  const isUser = message.role === 'user'
  return (
    <div className={`chat-message ${isUser ? 'user' : ''}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar-msg' : 'ai-avatar-msg'}`}>
        {isUser ? userInitials : '⚖️'}
      </div>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{message.content}</div>
        {!isUser && message.sources?.length > 0 && (
          <div className="message-sources">
            <p style={{ marginBottom: 6, fontWeight: 600 }}>Sources:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {message.sources.map((s, i) => (
                <span key={i} className="source-chip">
                  <BookOpen size={10} />
                  {s.source} {s.page ? `p.${s.page}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: isUser ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)', marginTop: 6, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

// ─── Session List Sidebar ───────────────────────────────────────────────────
function SessionList({ sessions, activeId, onSelect, onDelete, onNew }) {
  return (
    <div style={{
      width: 260, borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)' }}>
        <button className="btn btn-primary w-full btn-sm" onClick={onNew}>
          <Plus size={15} /> New Chat
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted" style={{ padding: 12, textAlign: 'center' }}>No sessions yet</p>
        ) : sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: 2,
              background: activeId === s.id ? 'var(--bg-hover)' : 'transparent',
              border: `1px solid ${activeId === s.id ? 'var(--border-default)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <MessageSquare size={14} style={{ color: 'var(--brand-400)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.title}
            </span>
            <button
              className="btn-icon"
              style={{ opacity: 0, padding: 4 }}
              onClick={e => { e.stopPropagation(); onDelete(s.id) }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Active Chat View ───────────────────────────────────────────────────────
function ActiveChat({ sessionId, userInitials }) {
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)
      try {
        const { data } = await chatApi.getSession(sessionId)
        setSession(data)
        setMessages(data.messages || [])
      } catch {
        toast.error('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  useEffect(() => { scrollToBottom() }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const question = input.trim()
    setInput('')

    // Optimistic user message
    const tempUserMsg = { id: Date.now(), role: 'user', content: question, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempUserMsg])
    setSending(true)

    try {
      const { data } = await chatApi.ask(sessionId, question)
      setMessages(prev => [...prev, data])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get response')
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Chat header */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Scale size={18} style={{ color: 'var(--brand-400)' }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{session?.title || 'Legal Chat'}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {session?.session_type === 'document' ? 'Document Q&A' : 'General Legal Q&A • Grounded in Indian Law'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, color: 'var(--text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>⚖️</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>Ask a Legal Question</h3>
            <p style={{ maxWidth: 400, fontSize: 14 }}>
              I'll answer based on Indian law with citations. Try asking about tenant rights, consumer protection, employment rights, or digital fraud.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {[
                'Can my landlord keep my security deposit?',
                'What are my rights if my e-commerce refund is denied?',
                'Is a verbal employment agreement legally valid?',
                'What should I do if I receive a fake job offer?',
              ].map(q => (
                <button key={q} className="btn btn-secondary btn-sm" onClick={() => setInput(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} userInitials={userInitials} />
        ))}
        {sending && (
          <div className="chat-message">
            <div className="message-avatar ai-avatar-msg">⚖️</div>
            <div className="message-bubble ai-bubble">
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-400)', animation: 'pulse 1s infinite' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-400)', animation: 'pulse 1s 0.2s infinite' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-400)', animation: 'pulse 1s 0.4s infinite' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="chat-input"
            rows={1}
            placeholder="Ask a legal question... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button
            id="chat-send"
            className="btn btn-primary"
            style={{ padding: '10px 14px', flexShrink: 0 }}
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            {sending ? <div className="spinner spinner-sm" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-sm text-muted" style={{ marginTop: 8, textAlign: 'center' }}>
          ⚠️ Informational only — not legal advice. Consult a qualified lawyer for your specific situation.
        </p>
      </div>
    </div>
  )
}

// ─── Main Legal Chat Page ───────────────────────────────────────────────────
export default function LegalChat() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const userInitials = localStorage.getItem('user')
    ? (JSON.parse(localStorage.getItem('user'))?.username?.[0] || 'U').toUpperCase()
    : 'U'

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await chatApi.listSessions()
      setSessions(data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const createSession = async () => {
    try {
      const { data } = await chatApi.createSession('general')
      setSessions(prev => [data, ...prev])
      navigate(`/chat/${data.id}`)
    } catch {
      toast.error('Failed to create session')
    }
  }

  const deleteSession = async (id) => {
    try {
      await chatApi.deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (sessionId == id) navigate('/chat')
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete session')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>
      <SessionList
        sessions={sessions}
        activeId={sessionId ? parseInt(sessionId) : null}
        onSelect={id => navigate(`/chat/${id}`)}
        onDelete={deleteSession}
        onNew={createSession}
      />

      {sessionId ? (
        <ActiveChat sessionId={parseInt(sessionId)} userInitials={userInitials} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64 }}>⚖️</div>
          <h2 style={{ color: 'var(--text-secondary)' }}>Legal Q&A Chatbot</h2>
          <p style={{ maxWidth: 400, fontSize: 15 }}>
            Ask legal questions in plain English and get cited answers grounded in Indian law.
            Select a session from the left or start a new one.
          </p>
          <button className="btn btn-primary btn-lg" onClick={createSession}>
            <Plus size={18} /> Start New Chat
          </button>
        </div>
      )}
    </div>
  )
}

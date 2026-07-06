import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MessageSquare, Send, Plus, Trash2, Scale, BookOpen, 
  Volume2, VolumeX, Mic, MicOff, Copy, RefreshCw 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { chatApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

// ─── Chat Message Bubble ────────────────────────────────────────────────────
function ChatMessage({ message, userInitials, onRegenerate }) {
  const isUser = message.role === 'user'
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakText = (text) => {
    window.speechSynthesis.cancel()
    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[^a-zA-Z0-9\s.,?!]/g, ""))
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Message copied to clipboard!')
  }

  return (
    <div className={`chat-message ${isUser ? 'user' : ''}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar-msg' : 'ai-avatar-msg'}`}>
        {isUser ? userInitials : '⚖️'}
      </div>
      
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        {/* Markdown-style blocks rendering fallback */}
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 14.5 }}>
          {message.content}
        </div>

        {/* Sources/Citations */}
        {!isUser && message.sources?.length > 0 && (
          <div className="message-sources" style={{ marginTop: 12, borderTop: '1px solid var(--border-default)', paddingTop: 10 }}>
            <p style={{ marginBottom: 6, fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Statutory Citations</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {message.sources.map((s, i) => (
                <span key={i} className="source-chip" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-base)', 
                  border: '1px solid var(--border-default)', padding: '4px 8px', borderRadius: 6, fontSize: 11
                }}>
                  <BookOpen size={10} className="text-indigo-400" />
                  {s.source} {s.page ? `p.${s.page}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bubble footer with actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: 11, 
          color: 'var(--text-muted)', 
          marginTop: 10 
        }}>
          <span>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn btn-ghost" 
              style={{ padding: '2px 4px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => copyToClipboard(message.content)}
            >
              <Copy size={11} /> Copy
            </button>
            {!isUser && (
              <button 
                className="btn btn-ghost" 
                style={{ padding: '2px 4px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onClick={() => speakText(message.content)}
              >
                {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />} {isSpeaking ? 'Mute' : 'Speak'}
              </button>
            )}
            {isUser && onRegenerate && (
              <button 
                className="btn btn-ghost" 
                style={{ padding: '2px 4px', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                onClick={() => onRegenerate(message.content)}
              >
                <RefreshCw size={11} /> Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Session List Sidebar ───────────────────────────────────────────────────
function SessionList({ sessions, activeId, onSelect, onDelete, onNew }) {
  return (
    <div style={{
      width: 280, borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(3, 3, 12, 0.2)',
    }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--border-default)' }}>
        <button className="btn btn-primary w-full btn-sm" onClick={onNew} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={15} /> New Session
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted" style={{ padding: 12, textAlign: 'center' }}>No sessions yet</p>
        ) : sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 4,
              background: activeId === s.id ? 'var(--bg-hover)' : 'transparent',
              border: `1px solid ${activeId === s.id ? 'var(--border-default)' : 'transparent'}`,
              transition: 'all 0.15s',
              position: 'relative'
            }}
          >
            <MessageSquare size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.title}
            </span>
            <button
              className="btn-icon"
              style={{ padding: 4, background: 'transparent', borderColor: 'transparent' }}
              onClick={e => { e.stopPropagation(); onDelete(s.id) }}
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
  const [isListening, setIsListening] = useState(false)
  
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
        toast.error('Failed to load chat logs')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  useEffect(() => { scrollToBottom() }, [messages])

  const handleSend = async (customQuestion = null) => {
    const question = (customQuestion || input).trim()
    if (!question || sending) return
    setInput('')
    window.speechSynthesis.cancel()

    // Add optimistic User Message
    const tempUserMsg = { id: Date.now(), role: 'user', content: question, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempUserMsg])
    setSending(true)

    try {
      const { data } = await chatApi.ask(sessionId, question)
      
      // Startup streaming simulation effect: display characters dynamically
      let currentString = ""
      const fullResponse = data.content
      const streamMsg = { ...data, content: "" }
      
      setMessages(prev => [...prev, streamMsg])

      let idx = 0
      const interval = setInterval(() => {
        if (idx < fullResponse.length) {
          currentString += fullResponse[idx]
          setMessages(prev => prev.map(m => m.id === data.id ? { ...m, content: currentString } : m))
          idx++
        } else {
          clearInterval(interval)
        }
      }, 5)

    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to get response')
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
    } finally {
      setSending(false)
    }
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech input is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-IN'
    
    recognition.onstart = () => {
      setIsListening(true)
      toast.success('Listening... speak your question.')
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Voice input error. Try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript
      setInput(resultText)
      toast.success('Text captured!')
    }

    recognition.start()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>
  if (!session) return null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Chat header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Scale size={18} className="text-indigo-400" />
        <div>
          <p style={{ fontSize: 14.5, fontWeight: 700 }}>{session.title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {session.session_type === 'document' ? 'Document Q&A' : 'General Legal Q&A • Indian Civil Codes'}
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48 }}>⚖️</div>
            <h3 style={{ color: 'var(--text-secondary)' }}>VeriLex Chat Advisor</h3>
            <p style={{ maxWidth: 440, fontSize: 13.5 }}>
              Ask a question about tenant lease disputes, consumer product refunds, labor notices, or generic legal definitions in India.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              {[
                'Can my landlord keep my security deposit?',
                'What are my rights if my refund is denied?',
                'Is a verbal agreement legally valid?',
                'How do BNS laws cover online identity scams?',
              ].map(q => (
                <button key={q} className="btn btn-secondary btn-sm" onClick={() => setInput(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            userInitials={userInitials} 
            onRegenerate={msg.role === 'user' ? (q) => handleSend(q) : null}
          />
        ))}
        {sending && (
          <div className="chat-message animate-pulse">
            <div className="message-avatar ai-avatar-msg">⚖️</div>
            <div className="message-bubble ai-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '14px 20px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 1s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 1s 0.2s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', animation: 'pulse 1s 0.4s infinite' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <button 
            className="btn-icon" 
            style={{ border: 'none', background: 'transparent' }} 
            onClick={startVoiceInput}
          >
            {isListening ? <MicOff size={16} className="text-red-400 animate-pulse" /> : <Mic size={16} />}
          </button>
          
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="chat-input"
            rows={1}
            placeholder="Describe your legal issue or ask a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          
          <button
            id="chat-send"
            className="btn btn-primary"
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)' }}
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-sm text-muted" style={{ marginTop: 8, textAlign: 'center', fontSize: 11.5 }}>
          ⚠️ Informational analysis only. Consult verified counsel for critical litigation.
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
      toast.error('Failed to start a new chat session')
    }
  }

  const deleteSession = async (id) => {
    try {
      await chatApi.deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      if (sessionId == id) navigate('/chat')
      toast.success('Chat session deleted')
    } catch {
      toast.error('Failed to delete session')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
          <h2 style={{ color: 'var(--text-secondary)' }}>AI Legal Chat Advisor</h2>
          <p style={{ maxWidth: 440, fontSize: 14.5 }}>
            Discuss legal terms, lease rules, and civic issues with references to actual Indian laws.
          </p>
          <button className="btn btn-primary btn-lg" onClick={createSession}>
            <Plus size={18} /> Start New Chat
          </button>
        </div>
      )}
    </div>
  )
}

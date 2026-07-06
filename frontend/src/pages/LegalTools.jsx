import { useState } from 'react'
import { 
  Shield, FileText, Gavel, Search, Globe, 
  AlertTriangle, CheckCircle, Copy, Download, 
  Sparkles, RefreshCw, Volume2, VolumeX, Mic, MicOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { toolsApi, scamApi } from '../services/api'
import RiskBadge from '../components/RiskBadge'

export default function LegalTools() {
  const [activeTab, setActiveTab] = useState('scam') // scam, summary, notice, ipc, translate
  
  // Voice Input settings
  const [isListening, setIsListening] = useState(false)
  const [voiceTargetField, setVoiceTargetField] = useState('')

  // Tool 1: Scam Check states
  const [scamInput, setScamInput] = useState('')
  const [scamType, setScamType] = useState('auto')
  const [scamResult, setScamResult] = useState(null)
  const [scamLoading, setScamLoading] = useState(false)

  // Tool 2: Summarizer states
  const [summaryInput, setSummaryInput] = useState('')
  const [summaryResult, setSummaryResult] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Tool 3: Notice Generator states
  const [noticeType, setNoticeType] = useState('demand_letter')
  const [noticeFacts, setNoticeFacts] = useState('')
  const [senderName, setSenderName] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [noticeDemands, setNoticeDemands] = useState('')
  const [noticeResult, setNoticeResult] = useState(null)
  const [noticeLoading, setNoticeLoading] = useState(false)

  // Tool 4: IPC Section Finder states
  const [ipcQuery, setIpcQuery] = useState('')
  const [ipcResult, setIpcResult] = useState(null)
  const [ipcLoading, setIpcLoading] = useState(false)

  // Tool 5: Translator states
  const [translateInput, setTranslateInput] = useState('')
  const [translateLang, setTranslateLang] = useState('hindi')
  const [translateResult, setTranslateResult] = useState(null)
  const [translateLoading, setTranslateLoading] = useState(false)

  // Voice Speech Synth (Read result aloud)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const speakText = (text) => {
    if (!text) return
    window.speechSynthesis.cancel()
    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 1000))
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Web Speech recognition
  const startSpeechRecognition = (fieldName, setter) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser.')
      return
    }
    window.speechSynthesis.cancel()
    setIsSpeaking(false)

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-IN'
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceTargetField(fieldName)
      toast.success('Listening... speak now.')
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Speech recognition error. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript
      setter(prev => prev ? prev + ' ' + speechToText : speechToText)
      toast.success('Text added!')
    }

    recognition.start()
  }

  // Handlers
  const handleScamCheck = async () => {
    if (scamInput.length < 20) {
      toast.error('Please enter at least 20 characters.')
      return
    }
    setScamLoading(true)
    try {
      const { data } = await scamApi.analyze({ input_text: scamInput, check_type: scamType })
      setScamResult(data)
      toast.success('Scam risk evaluation complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setScamLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (summaryInput.length < 50) {
      toast.error('Please enter at least 50 characters to summarize.')
      return
    }
    setSummaryLoading(true)
    try {
      const { data } = await toolsApi.summarize({ text: summaryInput })
      setSummaryResult(data)
      toast.success('Summarized successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Summarization failed')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleNoticeGenerate = async () => {
    if (!noticeFacts || !senderName || !recipientName || !noticeDemands) {
      toast.error('Please fill in all notice fields.')
      return
    }
    setNoticeLoading(true)
    try {
      const { data } = await toolsApi.notice({
        notice_type: noticeType,
        facts: noticeFacts,
        sender_name: senderName,
        recipient_name: recipientName,
        demands: noticeDemands
      })
      setNoticeResult(data)
      toast.success('Notice letter drafted!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Notice generation failed')
    } finally {
      setNoticeLoading(false)
    }
  }

  const handleIpcLookup = async () => {
    if (ipcQuery.length < 10) {
      toast.error('Describe the crime/situation in more detail (min 10 chars).')
      return
    }
    setIpcLoading(true)
    try {
      const { data } = await toolsApi.ipcBns({ query: ipcQuery })
      setIpcResult(data)
      toast.success('IPC/BNS Sections identified!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Search failed')
    } finally {
      setIpcLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (translateInput.length < 10) {
      toast.error('Enter at least 10 characters to translate.')
      return
    }
    setTranslateLoading(true)
    try {
      const { data } = await toolsApi.translate({ text: translateInput, target_language: translateLang })
      setTranslateResult(data)
      toast.success('Translation completed!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Translation failed')
    } finally {
      setTranslateLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles className="text-indigo-400" />
          AI Legal Suite
        </h1>
        <p className="page-subtitle">A collection of smart tools to analyze risk, generate draft forms, summarize litigation, and map out sections.</p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        borderBottom: '1px solid var(--border-default)', 
        paddingBottom: 12,
        marginBottom: 28,
        overflowX: 'auto'
      }}>
        {[
          { id: 'scam', label: 'Scam Detector', icon: Shield },
          { id: 'summary', label: 'Case Summarizer', icon: FileText },
          { id: 'notice', label: 'Legal Notice Draft', icon: Gavel },
          { id: 'ipc', label: 'IPC/BNS Section Finder', icon: Search },
          { id: 'translate', label: 'Legal Translator', icon: Globe },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id)
              window.speechSynthesis.cancel()
              setIsSpeaking(false)
            }}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13.5 }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in">
        
        {/* TAB 1: SCAM CHECK */}
        {activeTab === 'scam' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Scan Messages or Offers</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Copy and paste a message, job description, investment pitch, or email to verify its risk levels.
              </p>
              
              <div className="form-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Suspicious Content</label>
                  <button 
                    onClick={() => startSpeechRecognition('scam', setScamInput)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    {isListening && voiceTargetField === 'scam' ? <MicOff size={12} className="animate-pulse" /> : <Mic size={12} />} Voice Input
                  </button>
                </div>
                <textarea 
                  placeholder="Paste the message content here... (e.g., Earn Rs.5000/day working from home by liking YouTube videos. Pay registration fee...)"
                  className="form-input"
                  style={{ minHeight: 180 }}
                  value={scamInput}
                  onChange={e => setScamInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Classification Type</label>
                  <select 
                    className="form-select"
                    value={scamType}
                    onChange={e => setScamType(e.target.value)}
                  >
                    <option value="auto">Auto-Detect Category</option>
                    <option value="job_offer">Job Offer / Assignment</option>
                    <option value="loan_offer">Urgent Loan App Offer</option>
                    <option value="investment">Crypto / Stock Investment Plan</option>
                    <option value="message">SMS / WhatsApp Message</option>
                  </select>
                </div>
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={handleScamCheck}
                disabled={scamLoading}
              >
                {scamLoading ? <><RefreshCw className="animate-spin" size={16} /> Evaluating...</> : <><Shield size={16} /> Run Scam Risk Scan</>}
              </button>
            </div>

            {/* Results pane */}
            <div>
              {scamResult ? (
                <div className="card" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>Scan Findings</h3>
                    <RiskBadge level={scamResult.risk_level} score={scamResult.risk_score} />
                  </div>

                  <p style={{ fontWeight: 600, color: '#ffffff', marginBottom: 14 }}>
                    Verdict: <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{scamResult.verdict}</span>
                  </p>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <button onClick={() => speakText(scamResult.recommendation)} className="btn btn-secondary btn-sm">
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />} Speak Recommendation
                    </button>
                  </div>

                  {scamResult.red_flags?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="form-label" style={{ marginBottom: 10, color: 'var(--danger)' }}>Red Flags Identified ({scamResult.red_flags.length})</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {scamResult.red_flags.map((flag, idx) => (
                          <div key={idx} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <AlertTriangle size={14} /> {flag.flag}
                            </p>
                            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>{flag.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scamResult.safe_signals?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="form-label" style={{ marginBottom: 10, color: 'var(--success)' }}>Green Signals</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {scamResult.safe_signals.map((sig, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                            <CheckCircle size={14} className="text-emerald-400" />
                            <span>{sig}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="form-label" style={{ marginBottom: 6 }}>Recommended Next Steps</p>
                    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 13.5, color: 'var(--text-secondary)' }}>
                      {scamResult.recommendation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border-strong)' }}>
                  <Shield size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Paste suspicious text and trigger scan to see results here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CASE SUMMARIZER */}
        {activeTab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Litigation & Case Summarizer</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Analyze court orders, judgments, FIR complaints, or legal descriptions to get a key-points briefing.
              </p>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Judgment / FIR / Dispute Facts</label>
                  <button 
                    onClick={() => startSpeechRecognition('summary', setSummaryInput)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    {isListening && voiceTargetField === 'summary' ? <MicOff size={12} className="animate-pulse" /> : <Mic size={12} />} Voice Input
                  </button>
                </div>
                <textarea 
                  placeholder="Paste the legal notice, judgment transcript, or FIR facts here..."
                  className="form-input"
                  style={{ minHeight: 220 }}
                  value={summaryInput}
                  onChange={e => setSummaryInput(e.target.value)}
                />
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={handleSummarize}
                disabled={summaryLoading}
              >
                {summaryLoading ? <><RefreshCw className="animate-spin" size={16} /> Summarizing...</> : <><FileText size={16} /> Analyze & Summarize</>}
              </button>
            </div>

            {/* Results pane */}
            <div>
              {summaryResult ? (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>Case Summary Overview</h3>
                    <button onClick={() => speakText(summaryResult.summary)} className="btn btn-secondary btn-sm">
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />} Speak
                    </button>
                  </div>

                  <p style={{ fontSize: 13.8, lineHeight: 1.7, marginBottom: 20, color: 'var(--text-primary)' }}>
                    {summaryResult.summary}
                  </p>

                  {summaryResult.key_points?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="form-label" style={{ marginBottom: 8 }}>Key Arguments & Findings</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {summaryResult.key_points.map((pt, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)' }}>
                            <span>⚖️</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {summaryResult.parties_involved?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="form-label" style={{ marginBottom: 8 }}>Parties Involved</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {summaryResult.parties_involved.map((party, idx) => (
                          <span key={idx} className="badge badge-blue">{party}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {summaryResult.outcome && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="form-label" style={{ marginBottom: 6 }}>Verdict / Status Outlook</p>
                      <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {summaryResult.outcome}
                      </div>
                    </div>
                  )}

                  {summaryResult.applicable_laws?.length > 0 && (
                    <div>
                      <p className="form-label" style={{ marginBottom: 8 }}>Applicable Legislation Cited</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {summaryResult.applicable_laws.map((law, idx) => (
                          <span key={idx} className="badge badge-medium">{law}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border-strong)' }}>
                  <FileText size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Analyze long legal text to extract key facts, litigation, and outcomes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LEGAL NOTICE GENERATOR */}
        {activeTab === 'notice' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Legal Notice Drafter</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Generate a formal legally-worded notice based on the facts and demands of your dispute.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Notice Type</label>
                  <select className="form-select" value={noticeType} onChange={e => setNoticeType(e.target.value)}>
                    <option value="demand_letter">General Demand Letter</option>
                    <option value="consumer_notice">Consumer Grievance Notice</option>
                    <option value="eviction">Tenant Eviction Notice</option>
                    <option value="cease_desist">Cease & Desist Notice</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sender Name</label>
                  <input type="text" placeholder="Your Name" className="form-input" value={senderName} onChange={e => setSenderName(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Recipient / Opposing Party</label>
                <input type="text" placeholder="Company Name or Individual" className="form-input" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Facts of the Case</label>
                  <button 
                    onClick={() => startSpeechRecognition('noticeFacts', setNoticeFacts)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    {isListening && voiceTargetField === 'noticeFacts' ? <MicOff size={12} className="animate-pulse" /> : <Mic size={12} />} Voice
                  </button>
                </div>
                <textarea 
                  placeholder="Describe the incident (e.g. Paid Rs.12,000 for a phone on 12th May, phone arrived broken, seller refused replacement...)" 
                  className="form-input" 
                  value={noticeFacts} 
                  onChange={e => setNoticeFacts(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Demands & Redressal</label>
                  <button 
                    onClick={() => startSpeechRecognition('noticeDemands', setNoticeDemands)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    {isListening && voiceTargetField === 'noticeDemands' ? <MicOff size={12} className="animate-pulse" /> : <Mic size={12} />} Voice
                  </button>
                </div>
                <textarea 
                  placeholder="What do you want them to do? (e.g. Full refund within 7 days, cover cost of litigation Rs.5000...)" 
                  className="form-input" 
                  value={noticeDemands} 
                  onChange={e => setNoticeDemands(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={handleNoticeGenerate}
                disabled={noticeLoading}
              >
                {noticeLoading ? <><RefreshCw className="animate-spin" size={16} /> Drafting...</> : <><Gavel size={16} /> Auto-Draft Legal Notice</>}
              </button>
            </div>

            {/* Results pane */}
            <div>
              {noticeResult ? (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15 }}>Notice Draft</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(noticeResult.notice_text)}>
                        <Copy size={12} /> Copy
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => speakText(noticeResult.notice_text)}>
                        {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />} Speak
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid var(--border-default)', marginBottom: 12 }}>
                    Subject: {noticeResult.subject}
                  </p>

                  <pre style={{ 
                    background: 'var(--bg-base)', border: '1px solid var(--border-default)', 
                    padding: 16, borderRadius: 'var(--radius-sm)', fontSize: 11.5, color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap', maxHeight: 380, overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.6
                  }}>
                    {noticeResult.notice_text}
                  </pre>

                  {noticeResult.legal_basis?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <p className="form-label" style={{ marginBottom: 6 }}>Legal Grounds</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {noticeResult.legal_basis.map((basis, idx) => (
                          <span key={idx} className="badge badge-blue">{basis}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border-strong)' }}>
                  <Gavel size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Enter dispute facts, demands, and parties to generate a formal notice letter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: IPC/BNS FINDER */}
        {activeTab === 'ipc' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>IPC & BNS Section Finder</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Describe a crime, civic scenario, or event (e.g. drunk driving, cyber blackmail, physical assault, property damage). 
                We will identify corresponding provisions under the Indian Penal Code (IPC) and Bharatiya Nyaya Sanhita (BNS 2023).
              </p>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Crime Scenario or Keywords</label>
                  <button 
                    onClick={() => startSpeechRecognition('ipc', setIpcQuery)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    {isListening && voiceTargetField === 'ipc' ? <MicOff size={12} className="animate-pulse" /> : <Mic size={12} />} Voice
                  </button>
                </div>
                <textarea 
                  placeholder="Describe what happened (e.g. Someone copied my banking details, created a fake profile and stole Rs 50,000 from my savings account...)"
                  className="form-input"
                  style={{ minHeight: 140 }}
                  value={ipcQuery}
                  onChange={e => setIpcQuery(e.target.value)}
                />
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={handleIpcLookup}
                disabled={ipcLoading}
              >
                {ipcLoading ? <><RefreshCw className="animate-spin" size={16} /> Scanning Codes...</> : <><Search size={16} /> Search Statutes</>}
              </button>
            </div>

            {/* Results pane */}
            <div>
              {ipcResult ? (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3>Identified Provisions</h3>
                    <button onClick={() => speakText(ipcResult.summary)} className="btn btn-secondary btn-sm">
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />} Speak Summary
                    </button>
                  </div>

                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                    {ipcResult.summary}
                  </p>

                  <p className="form-label" style={{ marginBottom: 12 }}>Statutory Citations</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {ipcResult.sections?.map((sec, idx) => (
                      <div key={idx} style={{ 
                        background: 'var(--bg-base)', border: '1px solid var(--border-default)', 
                        padding: 16, borderRadius: 'var(--radius-sm)' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                            {sec.act} - {sec.section}
                          </span>
                          <span className={`badge badge-${sec.act === 'BNS' ? 'blue' : 'medium'}`}>{sec.act}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-accent)', marginBottom: 6 }}>
                          {sec.title}
                        </p>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
                          {sec.description}
                        </p>
                        {sec.punishment && (
                          <p style={{ fontSize: 11.5, color: '#fca5a5', borderTop: '1px dashed var(--border-default)', paddingTop: 6 }}>
                            ⚠️ Punishment: {sec.punishment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border-strong)' }}>
                  <Search size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Describe details to lookup sections, punishments, and relevant definitions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REGIONAL LANGUAGE TRANSLATOR */}
        {activeTab === 'translate' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Legal Document Translator</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Translate complex contracts, petitions, or warnings into regional Indian languages. 
                Our AI preserves exact legal definitions.
              </p>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Original English Legal Text</label>
                  <button 
                    onClick={() => startSpeechRecognition('translate', setTranslateInput)} 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: 11 }}
                  >
                    {isListening && voiceTargetField === 'translate' ? <MicOff size={12} className="animate-pulse" /> : <Mic size={12} />} Voice
                  </button>
                </div>
                <textarea 
                  placeholder="Paste English legal text here..."
                  className="form-input"
                  style={{ minHeight: 180 }}
                  value={translateInput}
                  onChange={e => setTranslateInput(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Target Indian Language</label>
                <select className="form-select" value={translateLang} onChange={e => setTranslateLang(e.target.value)}>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Malayalam">Malayalam (മലയാളம்)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                  <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>

              <button 
                className="btn btn-primary w-full"
                onClick={handleTranslate}
                disabled={translateLoading}
              >
                {translateLoading ? <><RefreshCw className="animate-spin" size={16} /> Translating...</> : <><Globe size={16} /> Translate Document</>}
              </button>
            </div>

            {/* Results pane */}
            <div>
              {translateResult ? (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>Regional Translation</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(translateResult.translated_text)}>
                        <Copy size={12} /> Copy
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => speakText(translateResult.translated_text)}>
                        {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />} Speak
                      </button>
                    </div>
                  </div>

                  <div style={{ 
                    background: 'var(--bg-base)', border: '1px solid var(--border-default)', 
                    padding: 16, borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--text-primary)',
                    maxHeight: 380, overflowY: 'auto', lineHeight: 1.7
                  }}>
                    {translateResult.translated_text}
                  </div>

                  {translateResult.notes && (
                    <div style={{ marginTop: 16 }}>
                      <p className="form-label" style={{ marginBottom: 6 }}>Terminology Notes</p>
                      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {translateResult.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border-strong)' }}>
                  <Globe size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Select target language and click translate to view regional translations.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

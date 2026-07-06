import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Scale, FileText, Gavel, Shield, MessageSquare, ArrowRight, Sparkles, Star, ChevronDown, CheckCircle2 } from 'lucide-react'

export default function Landing() {
  const [billingPeriod, setBillingPeriod] = useState('monthly') // monthly, yearly
  const [openFaq, setOpenFaq] = useState(null)

  const features = [
    {
      icon: <FileText className="text-indigo-400" size={24} />,
      title: 'Document Intelligence',
      description: 'Upload rental, loan, or employment contracts. AI extracts key provisions, flags hidden risks, and flags missing information.',
    },
    {
      icon: <Gavel className="text-purple-400" size={24} />,
      title: 'Complaint Letter Drafter',
      description: 'Describe consumer or labor grievances in plain English. Instantly get a formal dispute letter prepared to file with authorities.',
    },
    {
      icon: <Shield className="text-emerald-400" size={24} />,
      title: 'Fraud Scan & Scam Detector',
      description: 'Run suspect job descriptions, loan invites, or phishing alerts to inspect details and check risk scores.',
    },
    {
      icon: <MessageSquare className="text-cyan-400" size={24} />,
      title: 'Legal Knowledge RAG Chatbot',
      description: 'Ask Indian consumer protection and labor law questions. Receive plain-English responses backed by statutory citations.',
    },
  ]

  const stats = [
    { value: '45k+', label: 'Documents Audited' },
    { value: '98.7%', label: 'Scam Scan Accuracy' },
    { value: '1.2s', label: 'Average Retrieval Time' },
    { value: '₹1.5Cr', label: 'Legal Expenses Saved' },
  ]

  const testimonials = [
    {
      quote: "VeriLex saved me from signing a lease with an unfair 3-year lock-in penalty. Highly recommended portfolio tool!",
      author: "Aditi Sharma",
      role: "Freelance Designer",
      rating: 5,
    },
    {
      quote: "The Complaint Generator drafted a dispute letter that got my e-commerce refund processed in just 48 hours.",
      author: "Rajesh Patel",
      role: "SME Owner",
      rating: 5,
    },
    {
      quote: "As a student, understanding rent agreements was impossible. VeriLex explained everything in plain words.",
      author: "Vikram Malhotra",
      role: "IIT Student",
      rating: 5,
    },
  ]

  const faqs = [
    {
      q: "Is VeriLex giving real legal advice?",
      a: "No. VeriLex is an AI assistant providing informational analyses and contract reviews based on publicly available Indian laws. It does not replace a professional lawyer."
    },
    {
      q: "What document formats are supported?",
      a: "We support PDF, DOCX, TXT, and scanned image formats (PNG, JPG, TIFF) via built-in optical character recognition (OCR)."
    },
    {
      q: "Does it support local Indian languages?",
      a: "Yes. Our AI Legal Translator supports translations to Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, and Gujarati."
    },
    {
      q: "Is my uploaded data safe?",
      a: "Absolutely. All uploads are stored locally in isolated volumes and never shared. You can delete your document data and embeddings at any time."
    }
  ]

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Navbar header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 40px',
        borderBottom: '1px solid var(--border-default)',
        background: 'rgba(3, 3, 12, 0.4)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ 
            width: 32, height: 32, 
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', 
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            Veri<span style={{ color: 'var(--brand-accent)' }}>Lex</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Sign Up Free</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '120px 24px 80px', 
        textAlign: 'center', 
        position: 'relative'
      }}>
        {/* Glow blob */}
        <div style={{ 
          position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 250, background: 'rgba(99, 102, 241, 0.15)', 
          filter: 'blur(100px)', borderRadius: '50%', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <div className="badge badge-blue" style={{ marginBottom: 24, padding: '6px 14px' }}>
            <Sparkles size={12} style={{ marginRight: 6 }} />
            VeriLex AI — Democratizing Legal Intelligence
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 7vw, 4.25rem)', 
            fontWeight: 800, 
            lineHeight: 1.15,
            letterSpacing: '-0.03em', 
            marginBottom: 24 
          }}>
            Your Personal AI Legal Assistant,<br />
            <span style={{ 
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}>Available 24/7.</span>
          </h1>

          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
            color: 'var(--text-secondary)', 
            maxWidth: 680, 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Understand dense contracts, auto-draft legal notices, summarize cases, flag scam alerts, and speak to an interactive legal advisor grounded in Indian civil laws.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Explore Modules
            </a>
          </div>
        </div>

        {/* Hero mockup preview */}
        <div style={{ 
          maxWidth: 960, margin: '80px auto 0', padding: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)',
          borderRadius: 24, boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ 
            background: 'var(--bg-elevated)', borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border-subtle)', minHeight: 380, display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 12 }}>app.verilex.ai/dashboard</span>
            </div>
            <div style={{ flex: 1, padding: 32, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, textAlign: 'left' }}>
              <div style={{ borderRight: '1px solid var(--border-default)', paddingRight: 20 }}>
                <p className="form-label" style={{ marginBottom: 12 }}>Document Risk Index</p>
                <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--warning)', marginBottom: 4 }}>7.2</div>
                <span className="badge badge-high" style={{ marginBottom: 16 }}>High Risk Level</span>
                <div className="skeleton skeleton-text title" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
              </div>
              <div>
                <p className="form-label" style={{ marginBottom: 12 }}>AI Audit Findings</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    "Liability capped unilaterally in section 8 (Unfair provision)",
                    "Ambiguous notice term for eviction (30 days vs local 90-day law requirement)",
                    "Missing arbitration dispute resolution clauses"
                  ].map((txt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--brand-primary)' }}>✦</span>
                      <span>{txt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '60px 24px', 
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28, textAlign: 'center' }}>
          {stats.map((s, idx) => (
            <div key={idx}>
              <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{s.value}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ marginBottom: 12 }}>All-In-One Legal Platform</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', fontSize: 15 }}>
            Powerful AI utility modules to help citizens review, draft, search, translate, and verify legal challenges.
          </p>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map((f, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 24px', background: 'rgba(99, 102, 241, 0.02)', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2>Loved by Citizens & Professionals</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Real feedback from developers and renters across India.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="card">
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" stroke="none" />)}
                </div>
                <p style={{ fontSize: 13.8, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 20, color: 'var(--text-secondary)' }}>
                  "{t.quote}"
                </p>
                <div>
                  <h4 style={{ fontSize: 14 }}>{t.author}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40 }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} className="card-elevated" style={{ overflow: 'hidden' }}>
                <div 
                  onClick={() => toggleFaq(idx)}
                  style={{ 
                    padding: '18px 24px', display: 'flex', justifyItems: 'center', 
                    justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' 
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14.5 }}>{faq.q}</span>
                  <ChevronDown size={18} style={{ 
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} />
                </div>
                {openFaq === idx && (
                  <div style={{ padding: '0 24px 20px', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '100px 24px', borderTop: '1px solid var(--border-default)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2>Fair & Transparent Plans</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '8px 0 20px' }}>Sign up and choose what fits your portfolio or organization.</p>
            
            {/* Toggle switch */}
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)', padding: 4, borderRadius: 100 }}>
              <button 
                onClick={() => setBillingPeriod('monthly')}
                className="btn btn-sm"
                style={{ 
                  borderRadius: 100, 
                  background: billingPeriod === 'monthly' ? 'var(--brand-primary)' : 'transparent',
                  color: billingPeriod === 'monthly' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod('yearly')}
                className="btn btn-sm"
                style={{ 
                  borderRadius: 100, 
                  background: billingPeriod === 'yearly' ? 'var(--brand-primary)' : 'transparent',
                  color: billingPeriod === 'yearly' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                Yearly (20% Off)
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* Plan 1 */}
            <div className="card">
              <h3 style={{ fontSize: 16, color: 'var(--text-muted)' }}>Free Core</h3>
              <p style={{ fontSize: 32, fontWeight: 800, margin: '12px 0 8px', color: '#fff' }}>₹0</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Free forever, perfect for quick portfolio review.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {["5 document uploads / month", "Core general legal Q&A", "Scam scanning", "General templates"].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn-secondary w-full">Sign Up Free</Link>
            </div>

            {/* Plan 2 */}
            <div className="card" style={{ border: '1px solid var(--brand-primary)', boxShadow: 'var(--shadow-glow)' }}>
              <span className="badge badge-blue" style={{ position: 'absolute', top: 12, right: 12 }}>Popular</span>
              <h3 style={{ fontSize: 16, color: '#ffffff' }}>Professional</h3>
              <p style={{ fontSize: 32, fontWeight: 800, margin: '12px 0 8px', color: '#fff' }}>
                {billingPeriod === 'monthly' ? '₹799' : '₹639'} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ month</span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Advanced RAG and custom dispute notice generators.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {["Unlimited uploads", "Autonomous Legal Agent audit", "Citations & laws lookup", "Voice output readout", "Translator suite"].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary w-full">Upgrade Now</Link>
            </div>

            {/* Plan 3 */}
            <div className="card">
              <h3 style={{ fontSize: 16, color: 'var(--text-muted)' }}>Enterprise</h3>
              <p style={{ fontSize: 32, fontWeight: 800, margin: '12px 0 8px', color: '#fff' }}>Custom</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Custom databases, custom integrations, API keys.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {["Dedicated vector collections", "Custom legal notice formats", "99.9% uptime SLA", "Private cluster hostings", "Tailored model tuning"].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}>
                    <CheckCircle2 size={14} className="text-indigo-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:support@verilex.ai" className="btn btn-secondary w-full">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 40px 40px',
        borderTop: '1px solid var(--border-default)',
        background: 'rgba(3, 3, 12, 0.6)'
      }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ 
                width: 28, height: 28, 
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', 
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 14
              }}>V</div>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>VeriLex</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 260 }}>
              AI-powered civic rights and legal intelligence platforms for Indian citizens.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontSize: 13, color: '#fff', marginBottom: 12 }}>Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create Account</Link>
              <a href="#features">AI Modules</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, color: '#fff', marginBottom: 12 }}>Newsletter</h4>
            <div style={{ display: 'flex', gap: 8, maxWidth: 280 }}>
              <input type="email" placeholder="Your email address" className="form-input" style={{ padding: '6px 12px', fontSize: 12.5 }} />
              <button className="btn btn-primary btn-sm" onClick={() => toast.success('Subscribed!')}>Join</button>
            </div>
          </div>
        </div>

        <div style={{ 
          maxWidth: 1024, margin: '0 auto', paddingTop: 20, 
          borderTop: '1px solid var(--border-subtle)', textAlign: 'center',
          fontSize: 12, color: 'var(--text-muted)'
        }}>
          &copy; {new Date().getFullYear()} VeriLex. Designed as a professional portfolio product.
        </div>
      </footer>
    </div>
  )
}

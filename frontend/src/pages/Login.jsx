import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Shield, Sparkles, Key, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Authentication Flow Tabs: 'password' or 'otp'
  const [authMethod, setAuthMethod] = useState('password')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpTimer, setOtpTimer] = useState(60)

  useEffect(() => {
    let interval
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpSent, otpTimer])

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      login(data.access_token, data.user)
      toast.success(`Welcome back, ${data.user.full_name || data.user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = () => {
    if (!email) {
      toast.error('Please enter your email first')
      return
    }
    setOtpSent(true)
    setOtpTimer(60)
    toast.success(`OTP code sent to ${email} (Simulated)`)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (!otpCode) {
      toast.error('Please enter the verification code')
      return
    }
    // Simulate login verification
    setLoading(true)
    setTimeout(() => {
      const mockUser = {
        id: 999,
        email: email,
        username: email.split('@')[0],
        full_name: email.split('@')[0].toUpperCase(),
        is_active: true,
        created_at: new Date().toISOString()
      }
      login("mock-jwt-token-otp", mockUser)
      toast.success(`Authenticated with Email OTP!`)
      navigate('/dashboard')
      setLoading(false)
    }, 1200)
  }

  const handleSocialLogin = (platform) => {
    toast.loading(`Redirecting to ${platform} Authorization ...`)
    setTimeout(() => {
      toast.dismiss()
      const mockUser = {
        id: 888,
        email: `portfolio_user@${platform.toLowerCase()}.com`,
        username: `${platform.toLowerCase()}_user`,
        full_name: platform + " Showcase User",
        is_active: true,
        created_at: new Date().toISOString()
      }
      login(`mock-jwt-${platform.toLowerCase()}`, mockUser)
      toast.success(`Connected successfully via ${platform}!`)
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
      position: 'relative'
    }}>
      {/* Background radial gradient */}
      <div style={{ 
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 440, height: 260, background: 'rgba(99, 102, 241, 0.15)', 
        filter: 'blur(100px)', borderRadius: '50%', zIndex: 0
      }} />

      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '36px 32px', zIndex: 1 }}>
        
        {/* Logo Icon */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ 
            width: 42, height: 42, 
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', 
            borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 12,
            boxShadow: 'var(--shadow-glow)'
          }}>V</div>
          <h2>Welcome to VeriLex</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Democratizing legal intelligence for everyone.</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', marginBottom: 24 }}>
          <button 
            onClick={() => { setAuthMethod('password'); setOtpSent(false); }}
            style={{ 
              flex: 1, padding: '10px 0', background: 'transparent', border: 'none',
              borderBottom: authMethod === 'password' ? '2px solid var(--brand-primary)' : 'none',
              color: authMethod === 'password' ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            Password Entry
          </button>
          <button 
            onClick={() => setAuthMethod('otp')}
            style={{ 
              flex: 1, padding: '10px 0', background: 'transparent', border: 'none',
              borderBottom: authMethod === 'otp' ? '2px solid var(--brand-primary)' : 'none',
              color: authMethod === 'otp' ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            Email OTP
          </button>
        </div>

        {/* Form elements */}
        {authMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  placeholder="name@domain.com" 
                  className="form-input" 
                  style={{ paddingLeft: 42 }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="form-input" 
                  style={{ paddingLeft: 42 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Verifying Profile...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    placeholder="name@domain.com" 
                    className="form-input" 
                    style={{ paddingLeft: 42 }}
                    value={email}
                    disabled={otpSent}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                {!otpSent && (
                  <button type="button" onClick={handleSendOtp} className="btn btn-secondary btn-sm" style={{ padding: '0 12px' }}>
                    Send Code
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {otpTimer}s remaining
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6}
                      className="form-input" 
                      style={{ paddingLeft: 42 }}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                    {loading ? 'Validating...' : 'Verify & Login'}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="btn btn-secondary">
                    Change Email
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Separator */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0',
          fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em'
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          <span>Or Continue With</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
        </div>

        {/* Social Auth Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleSocialLogin('Google')} style={{ gap: 8 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.488 0 2.85.522 3.924 1.386l3.057-3.057C18.895 2.062 15.753 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.746-.067-1.314-.216-1.984H12.24z"/></svg> Google
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleSocialLogin('GitHub')} style={{ gap: 8 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
          </button>
        </div>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--brand-accent)' }}>
            Register Free
          </Link>
        </p>

      </div>
    </div>
  )
}

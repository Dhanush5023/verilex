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

  useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.data?.type === 'google-success' || event.data?.type === 'github-success') {
        const { name, email } = event.data
        const platformName = event.data.type === 'google-success' ? 'Google' : 'GitHub'
        const mockUser = {
          id: event.data.type === 'google-success' ? 888 : 887,
          email: email,
          username: email.split('@')[0],
          full_name: name,
          is_active: true,
          created_at: new Date().toISOString()
        }
        login(`mock-jwt-${platformName.toLowerCase()}`, mockUser)
        toast.success(`Connected successfully via ${platformName}!`)
        navigate('/dashboard')
      }
    }
    window.addEventListener('message', handleOAuthMessage)
    return () => window.removeEventListener('message', handleOAuthMessage)
  }, [login, navigate])

  const openGooglePopup = () => {
    const width = 450
    const height = 580
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const popup = window.open(
      '',
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,location=no,toolbar=no,menubar=no`
    )
    
    if (!popup) {
      toast.error('Popup blocked by browser. Please allow popups.')
      return
    }
    
    popup.document.write(`
      <html>
        <head>
          <title>Sign in - Google Accounts</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #ffffff;
              color: #202124;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              user-select: none;
            }
            .container {
              width: 350px;
              text-align: center;
              border: 1px solid #dadce0;
              border-radius: 8px;
              padding: 30px 24px;
            }
            .logo {
              display: inline-flex;
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 16px;
            }
            .title {
              font-size: 22px;
              font-weight: 400;
              margin-bottom: 6px;
            }
            .subtitle {
              font-size: 14px;
              color: #5f6368;
              margin-bottom: 24px;
            }
            .account-list {
              display: flex;
              flex-direction: column;
              border-top: 1px solid #dadce0;
              border-bottom: 1px solid #dadce0;
              margin-bottom: 24px;
            }
            .account-item {
              display: flex;
              align-items: center;
              padding: 12px 6px;
              cursor: pointer;
              border-bottom: 1px solid #f1f3f4;
              transition: background 0.15s;
            }
            .account-item:last-child {
              border-bottom: none;
            }
            .account-item:hover {
              background: #f8f9fa;
            }
            .avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #e8f0fe;
              color: #1a73e8;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              font-size: 14px;
            }
            .info {
              text-align: left;
            }
            .name {
              font-size: 13.5px;
              font-weight: 500;
              color: #3c4043;
            }
            .email {
              font-size: 11.5px;
              color: #5f6368;
            }
            .footer {
              font-size: 12px;
              color: #5f6368;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <span style="color:#4285F4">G</span>
              <span style="color:#EA4335">o</span>
              <span style="color:#FBBC05">o</span>
              <span style="color:#4285F4">g</span>
              <span style="color:#34A853">l</span>
              <span style="color:#EA4335">e</span>
            </div>
            <div class="title">Choose an account</div>
            <div class="subtitle">to continue to VeriLex</div>
            
            <div class="account-list">
              <div class="account-item" onclick="select('Dhanush Kumar', 'dhanush5023@gmail.com')">
                <div class="avatar">D</div>
                <div class="info">
                  <div class="name">Dhanush Kumar</div>
                  <div class="email">dhanush5023@gmail.com</div>
                </div>
              </div>
              <div class="account-item" onclick="select('Guest Reviewer', 'guest.reviewer@gmail.com')">
                <div class="avatar" style="background:#e6fffa; color:#0d9488;">G</div>
                <div class="info">
                  <div class="name">Guest Reviewer</div>
                  <div class="email">guest.reviewer@gmail.com</div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              Google will share your name and email address with VeriLex.
            </div>
          </div>

          <script>
            function select(name, email) {
              window.opener.postMessage({ type: 'google-success', name, email }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `)
  }

  const openGithubPopup = () => {
    const width = 500
    const height = 620
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const popup = window.open(
      '',
      'GitHubSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,location=no,toolbar=no,menubar=no`
    )
    
    if (!popup) {
      toast.error('Popup blocked by browser. Please allow popups.')
      return
    }
    
    popup.document.write(`
      <html>
        <head>
          <title>Authorize VeriLex - GitHub</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              background: #0d1117;
              color: #c9d1d9;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              user-select: none;
            }
            .container {
              width: 380px;
              background: #161b22;
              border: 1px solid #30363d;
              border-radius: 6px;
              padding: 24px;
              text-align: center;
            }
            .logo {
              margin-bottom: 20px;
              color: #ffffff;
            }
            .title {
              font-size: 18px;
              font-weight: 500;
              margin-bottom: 8px;
              color: #ffffff;
            }
            .auth-grid {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              margin: 20px 0;
            }
            .avatar-box {
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: #30363d;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 16px;
            }
            .line {
              height: 2px;
              width: 30px;
              background: #30363d;
            }
            .btn-authorize {
              background: #238636;
              color: #ffffff;
              border: 1px solid rgba(240,246,252,0.1);
              border-radius: 6px;
              padding: 10px 16px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              width: 100%;
              margin-bottom: 12px;
            }
            .btn-authorize:hover {
              background: #2ea043;
            }
            .btn-cancel {
              background: transparent;
              color: #8b949e;
              border: none;
              cursor: pointer;
              font-size: 12px;
            }
            .btn-cancel:hover {
              color: #58a6ff;
            }
            .perms {
              text-align: left;
              font-size: 12px;
              color: #8b949e;
              background: #0d1117;
              padding: 12px;
              border: 1px solid #30363d;
              border-radius: 6px;
              margin-bottom: 20px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <svg height="40" viewBox="0 0 16 16" version="1.1" width="40" fill="currentColor"><path d="M8 0c-4.42 0-8 3.58-8 8 0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            </div>
            <div class="title">Authorize VeriLex</div>
            
            <div class="auth-grid">
              <div class="avatar-box">V</div>
              <div class="line"></div>
              <div class="avatar-box" style="background:#58a6ff; color:#0d1117;">U</div>
            </div>
            
            <div class="perms">
              <strong>VeriLex</strong> requests access to:
              <ul style="margin: 6px 0 0 14px; padding: 0;">
                <li>Read access to public profile</li>
                <li>Read access to email address</li>
              </ul>
            </div>
            
            <button class="btn-authorize" onclick="authorize('Dhanush Kumar GitHub', 'dhanush.github@gmail.com')">
              Authorize Dhanush5023
            </button>
            <div>
              <button class="btn-cancel" onclick="window.close()">Cancel</button>
            </div>
          </div>

          <script>
            function authorize(name, email) {
              window.opener.postMessage({ type: 'github-success', name, email }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `)
  }

  const handleSocialLogin = (platform) => {
    if (platform === 'Google') {
      openGooglePopup()
    } else {
      openGithubPopup()
    }
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
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleSocialLogin('Google')} style={{ gap: 8 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.488 0 2.85.522 3.924 1.386l3.057-3.057C18.895 2.062 15.753 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.746-.067-1.314-.216-1.984H12.24z"/></svg> Google
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleSocialLogin('GitHub')} style={{ gap: 8 }}>
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

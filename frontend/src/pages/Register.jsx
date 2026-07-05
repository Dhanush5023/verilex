import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LogoIcon from '../components/LogoIcon'

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      login(data.access_token, data.user)
      toast.success('Account created! Welcome to VeriLex.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-bg" />
      <div className="auth-card animate-fade-in">
        <div className="auth-logo">
          <div className="sidebar-logo-icon"><LogoIcon size={18} /></div>
          <div className="sidebar-logo-text">Veri<span>Lex</span></div>
        </div>

        <h2 style={{ marginBottom: 8 }}>Create your account</h2>
        <p className="text-secondary text-sm" style={{ marginBottom: 28 }}>Free forever. No credit card needed.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="reg-fullname" type="text" className="form-input" placeholder="Arjun Sharma"
                value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input id="reg-username" type="text" className="form-input" placeholder="arjun123"
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="reg-email" type="email" className="form-input" placeholder="arjun@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-secondary text-sm" style={{ textAlign: 'center', marginTop: 20 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

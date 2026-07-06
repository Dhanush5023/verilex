import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, MessageSquare,
  ShieldAlert, Scale, LogOut, Gavel, Sparkles, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LogoIcon from './LogoIcon'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
]

const moduleItems = [
  { to: '/documents', icon: FileText,       label: 'Document Analysis',  sublabel: 'Mod 1' },
  { to: '/complaint', icon: Gavel,          label: 'Complaint Drafter',  sublabel: 'Mod 2' },
  { to: '/tools',     icon: Sparkles,       label: 'AI Tools Suite',     sublabel: 'Mods 3-8' },
  { to: '/chat',      icon: MessageSquare,  label: 'Legal Chat',         sublabel: 'Mod 4' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.[0]?.toUpperCase() || 'U'

  return (
    <>
      {/* Mobile Hamburger menu */}
      <button 
        className="mobile-hamburger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar container */}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <LogoIcon size={18} />
          </div>
          <div className="sidebar-logo-text">
            Veri<span>Lex</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <p className="sidebar-section-label">Overview</p>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} className="nav-icon" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-section">
            <p className="sidebar-section-label">AI Modules</p>
            {moduleItems.map(({ to, icon: Icon, label, sublabel }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} className="nav-icon" />
                <span>
                  {label}
                  <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 6 }}>{sublabel}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.full_name || user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

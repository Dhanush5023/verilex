import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DocumentAnalysis from './pages/DocumentAnalysis'
import ComplaintDrafter from './pages/ComplaintDrafter'
import ScamDetector from './pages/ScamDetector'
import LegalChat from './pages/LegalChat'

// ─── Protected Route Wrapper ─────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// ─── App Layout (with sidebar) ────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected routes with sidebar layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <AppLayout><DocumentAnalysis /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/documents/:id" element={
        <ProtectedRoute>
          <AppLayout><DocumentAnalysis /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/complaint" element={
        <ProtectedRoute>
          <AppLayout><ComplaintDrafter /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/scam" element={
        <ProtectedRoute>
          <AppLayout><ScamDetector /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <AppLayout><LegalChat /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat/:sessionId" element={
        <ProtectedRoute>
          <AppLayout><LegalChat /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

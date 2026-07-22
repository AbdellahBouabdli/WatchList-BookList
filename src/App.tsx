import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SearchResults } from './components/SearchResults'
import { WatchlistPage } from './components/WatchlistPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { MiniTicket } from './components/MiniTicket'
import './App.css'

function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

  return (
    <div className="app">
      <header className="app-header">
        <div className="ticket-cutout-left"></div>
        <div className="ticket-cutout-right"></div>
        
        <div className="app-header-top">
          <Link to="/" className="logo-section" style={{ textDecoration: 'none' }}>
            <div className="logo-icon">🎟️</div>
            <div className="logo-text">
              <div className="logo-title">WATCH <span className="tracker">TRACKER</span></div>
              <div className="logo-subtitle">MEDIA LOG / NO. 883-04A</div>
            </div>
          </Link>
          
          <nav className="app-nav">
            {user ? (
              <>
                <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                  [01] DISCOVER
                </Link>
                <Link to="/watchlist" className={`nav-item ${location.pathname === '/watchlist' ? 'active' : ''}`}>
                  [02] MY LIST
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`} style={{ color: 'var(--accent-color)' }}>
                    [03] ADMIN VAULT
                  </Link>
                )}
                <MiniTicket />
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
                  [01] LOGIN
                </Link>
                <Link to="/signup" className={`nav-item ${location.pathname === '/signup' ? 'active' : ''}`}>
                  [02] SIGN UP
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">
        {children}
      </main>
      
      <footer style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <div className="dashed-line"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>
          <div>BOX OFFICE CLERK NO. 09 // BUILT FOR CASUAL FILM & LITERARY CATALOGING</div>
          <div>© WATCH TRACKER.</div>
        </div>
      </footer>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/watchlist" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/watchlist" replace /> : <SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route path="/" element={<SearchResults />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
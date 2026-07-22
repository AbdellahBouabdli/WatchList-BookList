import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('verified') === 'true') {
      setSuccessMsg('TICKET PRINTED! PLEASE CHECK YOUR EMAIL TO VERIFY YOUR PASSKEY BEFORE ENTERING.')
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/watchlist')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="ticket-cutout-left" style={{ top: '65%' }}></div>
        <div className="ticket-cutout-right" style={{ top: '65%' }}></div>
        
        <div className="auth-card-inner">
          <div className="auth-header-ticket">
            <div className="ticket-number">NO. 00892</div>
            <div className="ticket-logo">🎟️</div>
            <div className="ticket-title">ADMIT ONE <span>TRACKER</span></div>
            <div className="ticket-subtitle">BOX OFFICE ADMISSION GATE</div>
          </div>

          <div className="dashed-line"></div>

          <div className="auth-form-header">
            <h2>[ ENTER PATRON CREDENTIALS ]</h2>
            <p>PROVIDE SECURE CREDENTIALS TO ACCESS YOUR MEDIA VAULT</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {successMsg && <div className="success-message" style={{ color: 'var(--accent-color)', border: '1px dashed var(--accent-color)', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>{successMsg}</div>}
            {error && <div className="error-message" style={{ color: 'var(--accent-color)', border: '1px dashed var(--accent-color)', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>{error}</div>}

            <div className="form-group">
              <label htmlFor="email">PATRON EMAIL: <span className="required-star">*</span></label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
                placeholder="@ PATRON@INDIECINEMA.COM"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">PASSKEY / PIN: <span className="required-star">*</span></label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="🔒 ••••••••"
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, opacity: 0.7 }}>
                <input type="checkbox" style={{ width: 'auto' }} />
                REMEMBER STATION
              </label>
              <Link to="/reset-password" style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                LOST TICKET?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'PRINTING...' : 'PRINT MY ACCESS TICKET →'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', margin: '2rem 0 1rem', fontSize: '0.65rem', opacity: 0.6 }}>
            -------- TEAR HERE FOR NEW PATRONS --------
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: '0.5rem' }}>
            FIRST TIME AT THE BOX OFFICE?
          </div>
          <Link to="/signup" className="btn btn-secondary btn-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            REGISTER ACCESS SLIP
          </Link>
        </div>
        
        <div className="auth-footer-ticket">
          <div className="barcode">1234567890</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>SECURE_GATE_AUTH_00892</div>
        </div>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>
          ← RETURN TO BOX OFFICE HOME
        </Link>
      </div>
    </div>
  )
}
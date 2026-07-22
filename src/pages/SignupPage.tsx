import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SignupPage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim()) {
      setError('Nickname is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password, nickname.trim())
    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      // Email confirmation sent - redirect to login with message
      navigate('/login?verified=true')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="ticket-cutout-left" style={{ top: '65%' }}></div>
        <div className="ticket-cutout-right" style={{ top: '65%' }}></div>
        
        <div className="auth-card-inner">
          <div className="auth-header-ticket">
            <div className="ticket-number">NO. 00893</div>
            <div className="ticket-logo">🎟️</div>
            <div className="ticket-title">ADMIT ONE <span>TRACKER</span></div>
            <div className="ticket-subtitle">NEW PATRON REGISTRATION</div>
          </div>

          <div className="dashed-line"></div>

          <div className="auth-form-header">
            <h2>[ REGISTER ACCESS SLIP ]</h2>
            <p>ESTABLISH CREDENTIALS FOR YOUR MEDIA VAULT</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message" style={{ color: 'var(--accent-color)', border: '1px dashed var(--accent-color)', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>{error}</div>}

            <div className="form-group">
              <label htmlFor="nickname">PATRON NICKNAME / ALIAS: <span className="required-star">*</span></label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                required
                disabled={loading}
                placeholder="👤 CINEPHILE_99"
              />
            </div>

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
                autoComplete="new-password"
                minLength={6}
                disabled={loading}
                placeholder="🔒 ••••••••"
              />
              <small className="hint" style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7 }}>AT LEAST 6 CHARACTERS</small>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword">VERIFY PASSKEY: <span className="required-star">*</span></label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
                placeholder="🔒 ••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'PROCESSING...' : 'MINT NEW ACCESS TICKET →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '2rem 0 1rem', fontSize: '0.65rem', opacity: 0.6 }}>
            -------- TEAR HERE FOR EXISTING PATRONS --------
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, marginBottom: '0.5rem' }}>
            ALREADY HOLD A TICKET?
          </div>
          <Link to="/login" className="btn btn-secondary btn-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            ENTER CREDENTIALS
          </Link>
        </div>

        <div className="auth-footer-ticket">
          <div className="barcode">9876543210</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>SECURE_GATE_REG_00893</div>
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
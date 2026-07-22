import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface ProfileModalProps {
  onClose: () => void
}

const avatarModules = import.meta.glob('/public/avatars/*.{jpg,jpeg,png,webp,svg}', { eager: true })

const FOLDER_AVATARS = Object.entries(avatarModules).map(([filePath, mod]: [string, any]) => {
  const fileName = filePath.split('/').pop() || ''
  const name = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  const url = (mod && typeof mod === 'string')
    ? mod
    : (mod && mod.default)
      ? mod.default
      : `/avatars/${fileName}`
  return { name, url }
})

const PRESET_AVATARS = [
  '🎟️', '🎬', '📚', '📽️', '🍿', '⭐', '🎞️', '🎭', '🕶️', '📀'
]

const TICKET_COLORS = [
  { id: 'gold', name: 'Classic Gold', border: '#eab308', bg: '#292524' },
  { id: 'crimson', name: 'Cinema Red', border: '#ef4444', bg: '#271c1c' },
  { id: 'cyan', name: 'Neon Cyan', border: '#06b6d4', bg: '#162e33' },
  { id: 'emerald', name: 'Emerald Vault', border: '#10b981', bg: '#172e27' },
  { id: 'purple', name: 'Velvet Purple', border: '#a855f7', bg: '#291e33' },
]

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { user, updateProfile, deleteAccount } = useAuth()

  const meta = user?.user_metadata || {}

  const [nickname, setNickname] = useState(meta.nickname || user?.email?.split('@')[0] || 'PATRON')
  const [avatarUrl, setAvatarUrl] = useState(meta.avatar_url || '')
  const [selectedEmoji, setSelectedEmoji] = useState(meta.avatar_emoji || '👤')
  const [ticketScale, setTicketScale] = useState<number>(meta.ticket_scale || 1)
  const [ticketColor, setTicketColor] = useState<string>(meta.ticket_color || 'gold')
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB')
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const { error: updateErr } = await updateProfile({
      nickname: nickname.trim(),
      avatar_url: avatarUrl,
      avatar_emoji: selectedEmoji,
      ticket_scale: Number(ticketScale),
      ticket_color: ticketColor,
    })

    setSaving(false)

    if (updateErr) {
      setError(updateErr.message)
    } else {
      setMessage('Ticket profile updated!')
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  const activeColorObj = TICKET_COLORS.find(c => c.id === ticketColor) || TICKET_COLORS[0]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="ticket-cutout-left" style={{ top: '50%' }}></div>
        <div className="ticket-cutout-right" style={{ top: '50%' }}></div>

        <button className="modal-close-btn" onClick={onClose} aria-label="Close profile modal">
          ✕
        </button>

        <div className="modal-header">
          <div className="ticket-logo" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎟️</div>
          <h2 className="uppercase tracking-wide" style={{ margin: 0 }}>[ PATRON TICKET CREDENTIALS ]</h2>
          <p style={{ fontSize: '0.7rem', opacity: 0.7, margin: '0.25rem 0 0 0' }}>CUSTOMIZE YOUR ADMIT-ONE MINI TICKET STUB</p>
        </div>

        <div className="dashed-line" style={{ margin: '1rem 0' }}></div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div className="error-message">{error}</div>}
          {message && <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center' }}>{message}</div>}

          {/* Ticket Live Preview */}
          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7, marginBottom: '0.75rem' }}>LIVE TICKET STUB PREVIEW:</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div 
                className={`mini-ticket-stub color-${ticketColor}`}
                style={{ 
                  transform: `scale(${ticketScale})`, 
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  borderColor: activeColorObj.border
                }}
              >
                <div className="ticket-cutout-left"></div>
                <div className="ticket-cutout-right"></div>
                
                <div className="mini-ticket-pfp">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="pfp" />
                  ) : (
                    <span className="mini-ticket-emoji">{selectedEmoji}</span>
                  )}
                </div>

                <div className="mini-ticket-info">
                  <span className="mini-ticket-name">{nickname || 'PATRON'}</span>
                  <span className="mini-ticket-sub">Nice Person • #883</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nickname Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="nickname" style={{ fontSize: '0.75rem', fontWeight: 700 }}>PATRON NICKNAME / ALIAS:</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              disabled={saving}
              placeholder="e.g. CINEPHILE_99"
            />
          </div>

          {/* PFP Customization */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>PROFILE PICTURE (PFP):</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                disabled={saving}
                placeholder="Paste Image URL or relative path (/avatars/...)"
                style={{ flex: 1 }}
              />
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', margin: 0 }}>
                📁 UPLOAD
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Folder Avatars Section */}
            <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-color)' }}>
              🖼️ SELECT FROM PUBLIC/AVATARS FOLDER:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {FOLDER_AVATARS.map(img => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setAvatarUrl(img.url)}
                  style={{
                    background: avatarUrl === img.url ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${avatarUrl === img.url ? 'var(--accent-color)' : 'var(--border-color)'}`,
                    padding: '0.3rem 0.5rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-color)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  <img src={img.url} alt={img.name} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                  {img.name}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.6rem', opacity: 0.6, fontStyle: 'italic', marginBottom: '0.75rem' }}>
            </div>

            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: '0.4rem' }}>OR CHOOSE AN ICON EMOJI:</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {PRESET_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setSelectedEmoji(emoji)
                    setAvatarUrl('') // reset url if icon selected
                  }}
                  style={{
                    background: selectedEmoji === emoji && !avatarUrl ? 'var(--accent-color)' : 'transparent',
                    border: '1px solid var(--border-color)',
                    fontSize: '1.1rem',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Ticket Size/Scale */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label htmlFor="ticketScale" style={{ fontSize: '0.75rem', fontWeight: 700 }}>MINI TICKET SIZE SCALE:</label>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                {Math.round(ticketScale * 100)}%
              </span>
            </div>
            <input
              id="ticketScale"
              type="range"
              min="0.75"
              max="1.35"
              step="0.05"
              value={ticketScale}
              onChange={e => setTicketScale(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', opacity: 0.6 }}>
              <span>SMALL (75%)</span>
              <span>STANDARD (100%)</span>
              <span>LARGE (135%)</span>
            </div>
          </div>

          {/* Ticket Accent Color */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>TICKET ACCENT COLOR:</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TICKET_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTicketColor(c.id)}
                  style={{
                    border: `2px solid ${c.border}`,
                    background: c.bg,
                    color: '#fff',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: ticketColor === c.id ? 1 : 0.6,
                    boxShadow: ticketColor === c.id ? `0 0 8px ${c.border}` : 'none'
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Patron Account Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px dashed #ef4444', padding: '0.6rem 0.75rem', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444' }}>
              ⚠️ DANGER ZONE: PATRON ACCOUNT
            </div>
            <button
              type="button"
              className="btn btn-sm"
              style={{ fontSize: '0.65rem', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer' }}
              onClick={async () => {
                if (confirm('Are you sure you want to permanently delete your Patron Account and clear all saved items? This action cannot be undone.')) {
                  await deleteAccount()
                  onClose()
                }
              }}
            >
              🗑️ DELETE ACCOUNT
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'SAVING TICKET...' : 'UPDATE PATRON TICKET →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

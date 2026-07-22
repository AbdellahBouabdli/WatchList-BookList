import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ProfileModal } from './ProfileModal'

export function MiniTicket() {
  const { user, signOut } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)

  if (!user) return null

  const meta = user.user_metadata || {}
  const nickname = meta.nickname || user.email?.split('@')[0] || 'PATRON'
  const avatarUrl = meta.avatar_url || ''
  const avatarEmoji = meta.avatar_emoji || '👤'
  const ticketScale = meta.ticket_scale || 1
  const ticketColor = meta.ticket_color || 'gold'

  return (
    <>
      <div className="mini-ticket-wrapper">
        <div 
          className={`mini-ticket-stub color-${ticketColor}`}
          onClick={() => setShowProfileModal(true)}
          style={{ 
            transform: `scale(${ticketScale})`, 
            transformOrigin: 'center right',
            cursor: 'pointer' 
          }}
          title="Click to customize Patron Ticket & Profile"
        >
          <div className="ticket-cutout-left"></div>
          <div className="ticket-cutout-right"></div>
          
          <div className="mini-ticket-pfp">
            {avatarUrl ? (
              <img src={avatarUrl} alt={nickname} />
            ) : (
              <span className="mini-ticket-emoji">{avatarEmoji}</span>
            )}
          </div>

          <div className="mini-ticket-info">
            <span className="mini-ticket-name">{nickname}</span>
            <span className="mini-ticket-sub">ADMIT ONE ⚙️</span>
          </div>
        </div>

        <button 
          className="nav-item logout-btn" 
          onClick={() => signOut()} 
          style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
          title="Log out patron session"
        >
          [OUT]
        </button>
      </div>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  )
}

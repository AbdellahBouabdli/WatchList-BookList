import { useState } from 'react'
import { useWatchlist } from '../context/WatchlistContext'
import { WatchlistItem } from '../lib/supabase'
import { StarRating } from './StarRating'
import { ItemDetailsModal } from './ItemDetailsModal'

type FilterStatus = 'all' | 'want_to_watch' | 'watched'

interface SpineItemProps {
  item: WatchlistItem
  index: number
  onUpdate: (id: string, updates: Partial<WatchlistItem>) => void
  onRemove: (id: string) => void
  onSelect: (item: { id: string; title: string; type: 'movie' | 'book'; posterUrl?: string | null }) => void
  updating: boolean
}

function SpineItem({ item, index, onUpdate, onRemove, onSelect, updating }: SpineItemProps) {
  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = item.status === 'watched' ? 'want_to_watch' : 'watched'
    onUpdate(item.id, { status: newStatus })
  }

  const handleRatingChange = (newRating: number | null) => {
    onUpdate(item.id, { rating: newRating })
  }

  const paddedIndex = String(index + 1).padStart(2, '0')

  return (
    <div className="spine-item" style={{ cursor: 'pointer' }} onClick={() => onSelect({ id: item.external_id, title: item.title, type: item.type, posterUrl: item.poster_url })}>
      <div className="ticket-cutout-left"></div>
      <div className="ticket-cutout-right"></div>
      
      <div className={`spine-type ${item.type}`}>
        {item.type === 'movie' ? 'FILM' : 'BOOK'}
      </div>
      
      <div className="spine-content">
        <div className="spine-info">
          <div className="spine-number">[{paddedIndex}]</div>
          <div className="spine-details">
            <h3 className="uppercase tracking-wide">{item.title}</h3>
            <div className="spine-meta uppercase">
              {item.notes ? `💬 "${item.notes.substring(0, 30)}${item.notes.length > 30 ? '...' : ''}"` : 'CLICK TO VIEW DETAILS & REVIEWS'}
            </div>
          </div>
        </div>
        
        <div className="spine-actions" onClick={e => e.stopPropagation()}>
          <div className="spine-rating" style={{ opacity: item.status === 'watched' ? 1 : 0.3 }}>
            PUNCH RATING: 
            <span className="spine-stars">
              <StarRating rating={item.rating || 0} onChange={handleRatingChange} size="sm" disabled={updating || item.status !== 'watched'} />
            </span>
          </div>
          
          <button className={`btn ${item.status === 'watched' ? 'btn-secondary' : ''}`} onClick={handleToggleStatus} disabled={updating}>
            {item.status === 'watched' ? 'COMPLETED' : 'WANT TO WATCH'}
          </button>
          
          <div className="action-buttons">
            <button
              className="btn btn-sm"
              style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}
              onClick={() => onSelect({ id: item.external_id, title: item.title, type: item.type, posterUrl: item.poster_url })}
            >
              📖 DETAILS
            </button>
            <button className="btn btn-icon" onClick={handleToggleStatus} disabled={updating}>
              {item.status === 'watched' ? '✓' : '○'}
            </button>
            <button className="btn btn-icon" onClick={() => onRemove(item.id)} disabled={updating}>
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WatchlistPage() {
  const { items, loading, error, fetchItems, updateItem, removeItem } = useWatchlist()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<{ id: string; title: string; type: 'movie' | 'book'; posterUrl?: string | null } | null>(null)

  const wantToWatchCount = items.filter(i => i.status === 'want_to_watch').length
  const watchedCount = items.filter(i => i.status === 'watched').length

  const filteredItems = items
    .filter(item => filterStatus === 'all' || item.status === filterStatus)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleUpdate = async (id: string, updates: Partial<WatchlistItem>) => {
    setUpdatingIds(prev => new Set(prev).add(id))
    const { error } = await updateItem(id, updates)
    setUpdatingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    if (error) {
      alert(error.message)
      fetchItems()
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Tear this stub from your list?')) return
    setUpdatingIds(prev => new Set(prev).add(id))
    const { error } = await removeItem(id)
    setUpdatingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    if (error) alert(error.message)
  }

  if (loading) return <div className="loading uppercase bold">Loading archive...</div>
  if (error) return <div className="error-message uppercase">Error accessing vault: {error.message}</div>

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-tabs">
          <button 
            className={`tab-btn ${filterStatus === 'want_to_watch' ? 'active' : ''}`}
            onClick={() => setFilterStatus('want_to_watch')}
          >
            WANT TO WATCH ({wantToWatchCount})
          </button>
          <button 
            className={`tab-btn ${filterStatus === 'watched' ? 'active' : ''}`}
            onClick={() => setFilterStatus('watched')}
          >
            🎬 COMPLETED RELEASES ({watchedCount})
          </button>
          <button 
            className={`tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            ALL
          </button>
        </div>
        
        <div className="toolbar-view">
          <span style={{ alignSelf: 'center', fontSize: '0.75rem', fontWeight: 700 }}>VIEW MODE:</span>
          <button className="tab-btn">▦ STUBS</button>
          <button className="tab-btn active">≡ SPINE VIEW</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.5rem' }}>
        <div>STACKED SPINES ({filteredItems.length} ITEMS IN QUEUE)</div>
        <div style={{ color: 'var(--accent-color)' }}>DRAG & DROP TO REORDER SEATS</div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="ticket-cutout-left" style={{ top: '50%' }}></div>
          <div className="ticket-cutout-right" style={{ top: '50%' }}></div>
          
          <div className="empty-state-icon">🎟️</div>
          <h3 className="uppercase tracking-wide">NO COMPLETED TICKETS ON SHELF</h3>
          <p className="uppercase">YOUR ARCHIVE IS CURRENTLY EMPTY. TICK THE "COMPLETED" CHECKBOX ON ANY ACTIVE TICKET STUB TO STORE IT HERE.</p>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
            GO DISCOVER MEDIA
          </button>
        </div>
      ) : (
        <div className="spine-list">
          {filteredItems.map((item, index) => (
            <SpineItem
              key={item.id}
              item={item}
              index={index}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              onSelect={setSelectedItem}
              updating={updatingIds.has(item.id)}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import { getUnifiedMediaDetails } from '../lib/api'
import { MediaDetail, SearchResultItem } from '../lib/api-types'
import { useWatchlist } from '../context/WatchlistContext'
import { useAuth } from '../context/AuthContext'
import { StarRating } from './StarRating'

interface ItemDetailsModalProps {
  item: SearchResultItem | { id: string; title: string; type: 'movie' | 'book'; posterUrl?: string | null }
  onClose: () => void
}

export function ItemDetailsModal({ item, onClose }: ItemDetailsModalProps) {
  const [detail, setDetail] = useState<MediaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const { user } = useAuth()
  const { getItemByExternalId, addItem, updateItem } = useWatchlist()

  const watchlistItem = getItemByExternalId(item.id)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getUnifiedMediaDetails(item.id, item.type, item.title, item.posterUrl)
      .then(res => {
        if (isMounted) {
          setDetail(res)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error(err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [item.id, item.type, item.title, item.posterUrl])

  useEffect(() => {
    if (watchlistItem?.notes) {
      setCommentText(watchlistItem.notes)
    } else {
      setCommentText('')
    }
  }, [watchlistItem?.notes])

  const handleAdd = async () => {
    if (!user) {
      alert('Please log in to add items to your list.')
      return
    }
    setUpdating(true)
    const { error } = await addItem({
      user_id: user.id,
      external_id: item.id,
      title: item.title,
      poster_url: item.posterUrl || detail?.posterUrl || null,
      type: item.type,
      status: 'want_to_watch',
      rating: null,
      notes: null,
    })
    setUpdating(false)
    if (error) alert(error.message)
  }

  const handleToggleStatus = async () => {
    if (!watchlistItem) return
    setUpdating(true)
    const newStatus = watchlistItem.status === 'watched' ? 'want_to_watch' : 'watched'
    const { error } = await updateItem(watchlistItem.id, { status: newStatus })
    setUpdating(false)
    if (error) alert(error.message)
  }

  const handleRatingChange = async (newRating: number | null) => {
    if (!watchlistItem) return
    setUpdating(true)
    const { error } = await updateItem(watchlistItem.id, { rating: newRating })
    setUpdating(false)
    if (error) alert(error.message)
  }

  const handleSaveComment = async () => {
    if (!watchlistItem) return
    setSavingComment(true)
    setSaveMessage('')
    const { error } = await updateItem(watchlistItem.id, { notes: commentText.trim() || null })
    setSavingComment(false)
    if (error) {
      alert(error.message)
    } else {
      setIsEditingComment(false)
      setSaveMessage('Comment updated!')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="ticket-cutout-left" style={{ top: '50%' }}></div>
        <div className="ticket-cutout-right" style={{ top: '50%' }}></div>

        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="modal-header">
          <div className={`poster-type-badge ${item.type}`} style={{ position: 'relative', top: 0, right: 0, display: 'inline-block' }}>
            {item.type === 'movie' ? 'CINEMA ARCHIVE' : 'LITERATURE ARCHIVE'}
          </div>
          <h2 className="uppercase tracking-wide" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            {detail?.title || item.title}
          </h2>
          {detail?.year && <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>RELEASE YEAR: {detail.year}</div>}
        </div>

        <div className="dashed-line" style={{ margin: '1rem 0' }}></div>

        {loading ? (
          <div className="loading uppercase bold" style={{ textAlign: 'center', padding: '2rem' }}>
            Fetching details from archive...
          </div>
        ) : (
          <div className="modal-content">
            <div className="modal-media-grid">
              <div className="modal-poster-container">
                {detail?.posterUrl ? (
                  <img src={detail.posterUrl} alt={detail.title} style={{ width: '100%', borderRadius: '4px' }} />
                ) : (
                  <div className="placeholder-image" style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {item.type === 'movie' ? '🎬' : '📚'}
                  </div>
                )}

                {/* Watchlist status & Quick Actions */}
                <div className="modal-watchlist-box" style={{ marginTop: '1rem' }}>
                  {watchlistItem ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        ✓ SAVED IN YOUR LIST
                      </div>
                      
                      <button
                        className={`btn ${watchlistItem.status === 'watched' ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={handleToggleStatus}
                        disabled={updating}
                        style={{ width: '100%', fontSize: '0.7rem' }}
                      >
                        {watchlistItem.status === 'watched' 
                          ? '✓ COMPLETED (WATCHED)' 
                          : 'MARK AS COMPLETED (WATCHED) →'}
                      </button>

                      <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                        PUNCH RATING:
                        <div style={{ marginTop: '0.25rem' }}>
                          <StarRating
                            rating={watchlistItem.rating || 0}
                            onChange={handleRatingChange}
                            size="md"
                            disabled={updating || watchlistItem.status !== 'watched'}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-secondary" onClick={handleAdd} disabled={updating} style={{ width: '100%' }}>
                      + SAVE TO WATCHLIST
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-info-container">
                {detail?.directorOrAuthor && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {item.type === 'movie' ? 'DIRECTOR' : 'AUTHOR'}: <span style={{ color: 'var(--accent-color)' }}>{detail.directorOrAuthor}</span>
                  </div>
                )}

                {detail?.genresOrSubjects && detail.genresOrSubjects.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                    {detail.genresOrSubjects.map((g, idx) => (
                      <span key={idx} className="genre-tag">
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {detail?.extraInfo && detail.extraInfo.length > 0 && (
                  <div className="extra-meta-grid" style={{ marginBottom: '1rem' }}>
                    {detail.extraInfo.map((info, idx) => (
                      <div key={idx} style={{ fontSize: '0.7rem' }}>
                        <strong>{info.label}:</strong> {info.value}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.8 }}>
                  SYNOPSIS / PLOT:
                </div>
                <p className="modal-description" style={{ fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1.5rem' }}>
                  {detail?.description || 'No detailed plot summary available for this archive record.'}
                </p>

                {/* Comment & Review Section */}
                <div className="modal-comment-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 className="uppercase" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', margin: 0 }}>
                      💬 CRITIC NOTES & REVIEWS
                    </h4>
                    {saveMessage && <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold' }}>{saveMessage}</span>}
                  </div>

                  {watchlistItem ? (
                    watchlistItem.status === 'watched' ? (
                      <div>
                        {isEditingComment || !watchlistItem.notes ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                              className="comment-textarea"
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              placeholder="WRITE YOUR THOUGHTS, REVIEW, OR CRITIQUE HERE..."
                              rows={3}
                              disabled={savingComment}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              {watchlistItem.notes && (
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    setCommentText(watchlistItem.notes || '')
                                    setIsEditingComment(false)
                                  }}
                                  disabled={savingComment}
                                >
                                  CANCEL
                                </button>
                              )}
                              <button className="btn btn-primary btn-sm" onClick={handleSaveComment} disabled={savingComment}>
                                {savingComment ? 'SAVING...' : 'SAVE REVIEW →'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="comment-display-box">
                            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                              "{watchlistItem.notes}"
                            </p>
                            <button
                              className="btn btn-sm"
                              onClick={() => setIsEditingComment(true)}
                              style={{ marginTop: '0.5rem', fontSize: '0.65rem' }}
                            >
                              ✏️ EDIT REVIEW
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="comment-locked-box" style={{ fontSize: '0.7rem', opacity: 0.7, fontStyle: 'italic' }}>
                        🔒 Mark this ticket as COMPLETED (Watched) to unlock personal reviews and notes.
                      </div>
                    )
                  ) : (
                    <div className="comment-locked-box" style={{ fontSize: '0.7rem', opacity: 0.7, fontStyle: 'italic' }}>
                      Add this item to your Watchlist to log personal notes and reviews.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

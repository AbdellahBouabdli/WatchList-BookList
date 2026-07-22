import { useState, useCallback, useEffect } from 'react'
import { useWatchlist } from '../context/WatchlistContext'
import { useAuth } from '../context/AuthContext'
import { searchAll } from '../lib/api'
import { SearchResultItem } from '../lib/api-types'
import { ItemDetailsModal } from './ItemDetailsModal'

interface SearchResultCardProps {
  item: SearchResultItem
  onAdd: (item: SearchResultItem) => void
  onSelect: (item: SearchResultItem) => void
  isInWatchlist: boolean
  adding: boolean
}

function getDeterministicRating(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  const positiveHash = Math.abs(hash)
  const rating = 7.5 + (positiveHash % 24) / 10
  return rating.toFixed(1)
}

function getDeterministicNumber(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 899) + 100
}

function SearchResultCard({ item, onAdd, onSelect, isInWatchlist, adding }: SearchResultCardProps) {
  const displayRating = getDeterministicRating(item.id)
  const displayId = getDeterministicNumber(item.id)
  
  return (
    <div className="poster-card" style={{ cursor: 'pointer' }} onClick={() => onSelect(item)}>
      <div className={`poster-type-badge ${item.type}`}>
        {item.type === 'movie' ? 'CINEMA' : 'LITERATURE'}
      </div>
      <div className="poster-image-container">
        {item.posterUrl ? (
          <img src={item.posterUrl} alt={item.title} loading="lazy" />
        ) : (
          <div className="placeholder-image" style={{ color: '#fff', opacity: 0.2 }}>
            {item.type === 'movie' ? '🎬' : '📚'}
          </div>
        )}
      </div>
      
      <div className="poster-info">
        <div className="poster-meta-top">
          <span>{item.type === 'movie' ? 'FILM' : 'BOOK'} NO. {displayId}</span>
          <span className="poster-rating">★ {displayRating} / 10</span>
        </div>
        
        <h3 className="poster-title uppercase">{item.title}</h3>
        
        <p className="poster-desc">
          {item.year ? `A classic release from ${item.year}. ` : ''}
          Click to view full plot details, status & reviews...
        </p>
        
        <div className="poster-footer" onClick={e => e.stopPropagation()}>
          <div className="poster-barcode">
            <span className="poster-barcode-bars" style={{ fontSize: '1.25rem' }}>||||||||||||</span>
            <span className="poster-id uppercase">{item.type === 'movie' ? 'ADMIT' : 'SHELF'}_{item.id.substring(0, 4)}</span>
          </div>
          
          <button
            className={`btn ${isInWatchlist ? '' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', whiteSpace: 'nowrap', minWidth: 'fit-content' }}
            onClick={() => onAdd(item)}
            disabled={adding || isInWatchlist}
          >
            {isInWatchlist ? '✓ SAVED' : '+ SAVE TO LIST'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SearchResults() {
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'book'>('all')
  const [movies, setMovies] = useState<SearchResultItem[]>([])
  const [books, setBooks] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { getItemByExternalId, addItem } = useWatchlist()
  const { user } = useAuth()
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true)
      try {
        const [movieRes, bookRes] = await Promise.all([
          searchAll('star', 1),
          searchAll('lord', 1)
        ])
        setMovies(movieRes.movies.slice(0, 4))
        setBooks(bookRes.books.slice(0, 4))
      } catch (err) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  const handleSearch = useCallback(async (searchQuery: string, pageNum = 1) => {
    setLoading(true)
    setError(null)

    const activeQuery = searchQuery.trim() || 'star'

    try {
      const results = await searchAll(activeQuery, pageNum)
      if (pageNum === 1) {
        setMovies(results.movies)
        setBooks(results.books)
      } else {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMovies = results.movies.filter(m => !existingIds.has(m.id))
          return [...prev, ...newMovies]
        })
        setBooks(prev => {
          const existingIds = new Set(prev.map(b => b.id))
          const newBooks = results.books.filter(b => !existingIds.has(b.id))
          return [...prev, ...newBooks]
        })
      }
      setHasMore(results.movies.length > 0 || results.books.length > 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    handleSearch(query, 1)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    handleSearch(query, nextPage)
  }

  const handleAdd = async (item: SearchResultItem) => {
    if (!user) {
      alert('You must be logged in to save items to your list.')
      return
    }

    setAddingIds(prev => new Set(prev).add(item.id))
    const { error } = await addItem({
      user_id: user.id,
      external_id: item.id,
      title: item.title,
      poster_url: item.posterUrl,
      type: item.type,
      status: 'want_to_watch',
      rating: null,
      notes: null,
    })
    setAddingIds(prev => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
    if (error) {
      alert(error.message)
    }
  }

  const isInWatchlist = (externalId: string) => !!getItemByExternalId(externalId)

  const displayedMovies = filterType === 'book' ? [] : movies
  const displayedBooks = filterType === 'movie' ? [] : books
  const totalResults = displayedMovies.length + displayedBooks.length

  return (
    <div>
      <div className="search-header" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
          <span>🔍 INITIATE SEARCH QUERY</span>
          <span style={{ color: 'var(--text-color)', opacity: 0.6 }}>SYSTEM_STATUS: {loading ? 'SEARCHING...' : 'READY'}</span>
        </div>
        
        <form onSubmit={handleSubmit} style={{ border: 'var(--border-width) solid var(--border-color)', marginBottom: '1rem' }}>
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ENTER MOVIE TITLE, BOOK AUTHOR, OR DIRECTOR..."
            />
            <button type="submit" className="btn btn-primary" style={{ borderLeft: 'var(--border-width) solid var(--border-color)', borderTop: 'none', borderBottom: 'none', borderRight: 'none' }} disabled={loading || !query.trim()}>
              {loading ? 'SEARCHING...' : 'SEARCH →'}
            </button>
          </div>
        </form>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.6 }}>FILTER BY MEDIA:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setFilterType('all')}
              className={`btn btn-sm ${filterType === 'all' ? 'btn-secondary' : ''}`} 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
              🎥 ALL RELEASES
            </button>
            <button 
              onClick={() => setFilterType('movie')}
              className={`btn btn-sm ${filterType === 'movie' ? 'btn-secondary' : ''}`} 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
              🎬 MOVIES ONLY
            </button>
            <button 
              onClick={() => setFilterType('book')}
              className={`btn btn-sm ${filterType === 'book' ? 'btn-secondary' : ''}`} 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}>
              📚 BOOKS ONLY
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="section-title-bar">
        <h2>🔥 POPULAR RELEASES ON SCREEN & SHELF</h2>
        <div className="matches-badge">{totalResults} MATCHES FOUND</div>
      </div>

      {(totalResults > 0) ? (
        <div className="results-grid">
          {displayedMovies.map(movie => (
            <SearchResultCard
              key={movie.id}
              item={movie}
              onAdd={handleAdd}
              onSelect={setSelectedItem}
              isInWatchlist={isInWatchlist(movie.id)}
              adding={addingIds.has(movie.id)}
            />
          ))}
          {displayedBooks.map(book => (
            <SearchResultCard
              key={book.id}
              item={book}
              onAdd={handleAdd}
              onSelect={setSelectedItem}
              isInWatchlist={isInWatchlist(book.id)}
              adding={addingIds.has(book.id)}
            />
          ))}
        </div>
      ) : (
        !loading && query && (
          <div className="empty-state">
            <h3 className="uppercase">NO ARCHIVES FOUND FOR "{query}"</h3>
            <p className="uppercase">TRY ADJUSTING YOUR SEARCH PARAMETERS OR FILTER SETTINGS.</p>
          </div>
        )
      )}

      {hasMore && totalResults > 0 && (
        <button className="btn btn-secondary load-more" style={{ width: '100%', marginTop: '3rem' }} onClick={handleLoadMore} disabled={loading}>
          {loading ? 'LOADING ARCHIVES...' : 'LOAD MORE ARCHIVES ↓'}
        </button>
      )}

      {selectedItem && (
        <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
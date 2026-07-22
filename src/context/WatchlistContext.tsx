import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { WatchlistItem, WatchlistItemInsert, WatchlistItemUpdate } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface WatchlistContextType {
  items: WatchlistItem[]
  loading: boolean
  error: Error | null
  fetchItems: () => Promise<void>
  addItem: (item: WatchlistItemInsert) => Promise<{ error: Error | null }>
  updateItem: (id: string, updates: WatchlistItemUpdate) => Promise<{ error: Error | null }>
  removeItem: (id: string) => Promise<{ error: Error | null }>
  getItemByExternalId: (externalId: string) => WatchlistItem | undefined
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const getStorageKey = useCallback(() => {
    return user?.id ? `patron_watchlist_items_${user.id}` : 'patron_watchlist_guest'
  }, [user?.id])

  // Load items from local storage fallback (scoped per user)
  const getLocalItems = useCallback((): WatchlistItem[] => {
    try {
      const cached = localStorage.getItem(getStorageKey())
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  }, [getStorageKey])

  // Save items to local storage fallback (scoped per user)
  const saveLocalItems = useCallback((newItems: WatchlistItem[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newItems))
    } catch {
      // ignore
    }
  }, [getStorageKey])

  const fetchItems = useCallback(async () => {
    if (!user?.id) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: sbError } = await supabase
        .from('watchlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (sbError) {
        console.warn('Supabase fetch notice, loading from local cache:', sbError.message)
        const local = getLocalItems()
        setItems(local)
      } else {
        const merged = data ?? []
        setItems(merged)
        saveLocalItems(merged)
      }
    } catch (err) {
      console.warn('Failed to fetch from remote database, using local cache:', err)
      const local = getLocalItems()
      setItems(local)
      if (local.length === 0) {
        setError(err instanceof Error ? err : new Error('Unable to access watchlist'))
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, getLocalItems, saveLocalItems])

  useEffect(() => {
    fetchItems()
  }, [user?.id, fetchItems])

  const addItem = async (item: WatchlistItemInsert) => {
    // Construct local item immediately
    const newItem: WatchlistItem = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item,
    }

    // Instantly update state & local storage
    setItems(prev => {
      // Avoid duplicates by external_id
      const exists = prev.some(i => i.external_id === item.external_id)
      if (exists) return prev
      const updated = [newItem, ...prev]
      saveLocalItems(updated)
      return updated
    })

    try {
      const { data, error: sbError } = await supabase
        .from('watchlist_items')
        .insert(item)
        .select()
        .single()

      if (sbError) {
        console.warn('Supabase insert notice (stored locally):', sbError.message)
      } else if (data) {
        // Replace temporary UUID with Supabase UUID if returned
        setItems(prev => {
          const updated = prev.map(i => i.external_id === item.external_id ? data : i)
          saveLocalItems(updated)
          return updated
        })
      }
    } catch (err) {
      console.warn('Supabase add item network error (stored locally):', err)
    }

    return { error: null }
  }

  const updateItem = async (id: string, updates: WatchlistItemUpdate) => {
    // Instantly update local state & local storage
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id || item.external_id === id) {
          return { ...item, ...updates, updated_at: new Date().toISOString() }
        }
        return item
      })
      saveLocalItems(updated)
      return updated
    })

    try {
      const { error: sbError } = await supabase
        .from('watchlist_items')
        .update(updates)
        .eq('id', id)

      if (sbError) {
        console.warn('Supabase update notice (updated locally):', sbError.message)
      }
    } catch (err) {
      console.warn('Supabase update item network error (updated locally):', err)
    }

    return { error: null }
  }

  const removeItem = async (id: string) => {
    // Instantly update local state & local storage
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id && item.external_id !== id)
      saveLocalItems(updated)
      return updated
    })

    try {
      const { error: sbError } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('id', id)

      if (sbError) {
        console.warn('Supabase delete notice (removed locally):', sbError.message)
      }
    } catch (err) {
      console.warn('Supabase remove item network error (removed locally):', err)
    }

    return { error: null }
  }

  const getItemByExternalId = useCallback((externalId: string) => {
    return items.find(item => item.external_id === externalId)
  }, [items])

  return (
    <WatchlistContext.Provider value={{ items, loading, error, fetchItems, addItem, updateItem, removeItem, getItemByExternalId }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}
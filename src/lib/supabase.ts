import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type helpers for our database
export type WatchlistItem = {
  id: string
  user_id: string
  external_id: string
  title: string
  poster_url: string | null
  type: 'movie' | 'book'
  status: 'want_to_watch' | 'watched'
  rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type WatchlistItemInsert = Omit<WatchlistItem, 'id' | 'created_at' | 'updated_at'>
export type WatchlistItemUpdate = Partial<Omit<WatchlistItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
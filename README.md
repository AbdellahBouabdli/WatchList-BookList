# Watchlist Tracker - Movie/Book Watchlist App

A full-stack React + Supabase application for tracking movies and books you want to watch/read.

## Features

- 🔍 **Search** movies (via OMDb API) and books (via Open Library API)
- 📋 **Watchlist** with status (Want to Watch / Watched) and 1-5 star ratings
- 🔐 **Authentication** with Supabase Auth (email/password)
- 🛡️ **Row Level Security** - users only see their own data
- 📱 **Responsive** design works on mobile and desktop

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **APIs**: OMDb (movies), Open Library (books)

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings > API** and copy:
   - Project URL
   - Anon (public) Key

### 2. Run Database Migration

In Supabase SQL Editor, run the migration from `supabase/migrations/001_create_watchlist_items.sql`:

```sql
-- This creates the watchlist_items table with RLS policies
-- See the full migration file for details
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OMDB_API_KEY=your-omdb-api-key  # Optional, for movie search
```

### 4. Get OMDb API Key (Optional)

1. Go to [omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. Get a free API key (1000 requests/day)
3. Add to `.env.local`

### 5. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProtectedRoute.tsx
│   ├── SearchResults.tsx
│   ├── StarRating.tsx
│   └── WatchlistPage.tsx
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   └── WatchlistContext.tsx
├── lib/                 # Utilities & API clients
│   ├── api.ts           # OMDb & Open Library API calls
│   ├── api-types.ts     # TypeScript types for APIs
│   └── supabase.ts      # Supabase client & DB types
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── ResetPasswordPage.tsx
│   └── SignupPage.tsx
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── App.css              # Styles
```

## Database Schema

```sql
watchlist_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,           -- OMDb imdbID or Open Library work ID
  title TEXT NOT NULL,
  poster_url TEXT,
  type TEXT CHECK (type IN ('movie', 'book')),
  status TEXT CHECK (status IN ('want_to_watch', 'watched')) DEFAULT 'want_to_watch',
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, external_id)
)
```

## RLS Policies (Critical!)

```sql
-- Enable RLS
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view their own watchlist items"
  ON watchlist_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items"
  ON watchlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON watchlist_items FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON watchlist_items FOR DELETE USING (auth.uid() = user_id);
```

## Common Mistakes to Avoid

### ❌ Forgetting RLS Policies
**Problem**: Without RLS, all users can see/edit/delete each other's watchlist items.
**Fix**: Always enable RLS and create policies for SELECT, INSERT, UPDATE, DELETE.

### ❌ Exposing Service Role Key
**Problem**: Using the `service_role` key in frontend exposes full database access.
**Fix**: Only use the `anon` key in frontend. Service role key stays in Supabase Edge Functions or server-side code.

### ❌ Not Handling Loading/Error States
**Problem**: UI freezes or shows stale data during async operations.
**Fix**: Always use loading states, error boundaries, and user feedback:

```tsx
const [loading, setLoading] = useState(false)
const [error, setError] = useState<Error | null>(null)

const handleAction = async () => {
  setLoading(true)
  setError(null)
  try {
    await doSomething()
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed'))
  } finally {
    setLoading(false)
  }
}
```

### ❌ Not Checking for Existing Items
**Problem**: Users can add duplicate items to watchlist.
**Fix**: Unique constraint on `(user_id, external_id)` + check before adding:

```tsx
const existing = items.find(i => i.external_id === newItem.external_id)
if (existing) {
  alert('Already in your watchlist!')
  return
}
```

### ❌ Trusting Client-Side Validation Only
**Problem**: Malicious users can bypass frontend validation.
**Fix**: Database constraints + RLS policies enforce data integrity server-side:

```sql
-- Database-level constraints
CHECK (rating BETWEEN 1 AND 5)
CHECK (type IN ('movie', 'book'))
CHECK (status IN ('want_to_watch', 'watched'))
UNIQUE (user_id, external_id)
```

### ❌ Not Handling Auth State Changes
**Problem**: User stays logged in after password reset, or UI doesn't update on logout.
**Fix**: Use `onAuthStateChange` listener:

```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
    setUser(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}, [])
```

### ❌ CORS Issues with External APIs
**Problem**: Direct frontend calls to APIs may fail due to CORS.
**Fix**: OMDb and Open Library allow CORS. For APIs that don't, use Supabase Edge Functions as a proxy.

### ❌ Not Indexing Foreign Keys
**Problem**: Slow queries on large watchlists.
**Fix**: Add indexes on frequently queried columns:

```sql
CREATE INDEX idx_watchlist_items_user_id ON watchlist_items(user_id);
CREATE INDEX idx_watchlist_items_status ON watchlist_items(user_id, status);
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

## Extending the App

### Add Movie/Book Details Page
Create a detail view using `getMovieDetails()` or `getBookDetails()` from `api.ts`.

### Add Categories/Tags
Extend schema with `tags TEXT[]` and UI for tagging items.

### Add Social Features
- Public profiles
- Share watchlists
- Follow friends

### Use Edge Functions for API Keys
If you want to hide OMDb key:
```typescript
// supabase/functions/search-movies/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { query } = await req.json()
  const response = await fetch(`https://www.omdbapi.com/?apikey=${Deno.env.get('OMDB_KEY')}&s=${query}`)
  return new Response(JSON.stringify(await response.json()))
})
```

## License

MIT
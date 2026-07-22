# Project Session Info: Watchlist Tracker

## Overview
Watchlist Tracker is a full-stack React + Supabase application for tracking movies and books you want to watch or read.

## Features
- **Search**: Movies (via OMDb API) and books (via Open Library API).
- **Watchlist**: Track status (Want to Watch / Watched) and provide 1-5 star ratings.
- **Authentication**: Supabase Auth (email/password).
- **Row Level Security (RLS)**: Users can only see and modify their own data.
- **Responsive Design**: Works on mobile and desktop.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, React Router DOM
- **Backend**: Supabase (Authentication + PostgreSQL database + RLS)
- **APIs**: OMDb (movies), Open Library (books)

## Project Structure
- `src/components/`: Reusable UI components (e.g., StarRating, SearchResults)
- `src/context/`: React Context providers (AuthContext, WatchlistContext)
- `src/lib/`: Utilities & API clients (Supabase client, API types)
- `src/pages/`: Page components (Login, Signup, Reset Password)
- `supabase/`: Database migrations and schema definitions

## Setup & Running Locally
1. Clone or ensure you are in the project root.
2. Install dependencies: `npm install`
3. Configure Environment Variables in `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OMDB_API_KEY` (Optional, for movie searches)
4. Start the development server: `npm run dev`
5. Open `http://localhost:5173`

## Database Schema (watchlist_items)
- `id`: UUID (Primary Key)
- `user_id`: UUID (References auth.users)
- `external_id`: TEXT (OMDb imdbID or Open Library work ID)
- `title`: TEXT
- `poster_url`: TEXT
- `type`: TEXT ('movie' or 'book')
- `status`: TEXT ('want_to_watch' or 'watched')
- `rating`: INTEGER (1-5)
- `notes`: TEXT
- `created_at` / `updated_at`: TIMESTAMPTZ

## Key Notes
- Ensure Supabase RLS is enabled so users cannot access each other's lists.
- Avoid using the `service_role` key in the frontend.

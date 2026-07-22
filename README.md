# 🎟️ Watchlist Tracker - Retro Cinema & Book Vault

A full-stack React + TypeScript + Vite + Supabase web application designed with a classic retro cinema ticket aesthetic for tracking films and literature you want to watch or read.

![Watchlist Tracker](public/avatars/cinema_stub.svg)

---

## ✨ Features

- 🎟️ **Retro Cinema Stub UI**: Beautiful ticket-stub interface featuring notch cutouts, customizable ticket colors, adjustable scaling, and custom PFP avatars.
- 🔍 **Unified Media Search**: Live search for Movies (via OMDb API) and Books (via Open Library API) with deterministic ratings and film serial numbers.
- 👤 **Custom Patron Profile**: 
  - Required Patron Nickname / Alias saved to Supabase Auth metadata.
  - Avatar PFP support (choose from `/public/avatars/`, custom image URL, or vintage emojis).
  - Customizable ticket scale (75% to 135%) and accent color themes (Classic Gold, Cinema Red, Neon Cyan, Emerald Vault, Velvet Purple).
- 🎬 **Details & Personal Reviews**:
  - Full plot details and release years.
  - Status toggle (`✓ SAVED IN YOUR LIST` ➔ `MARK AS COMPLETED (WATCHED)`).
  - Star rating & editable critic notes/reviews.
- 🔒 **Account-Isolated Watchlist**:
  - Row Level Security (RLS) ensures users only see their own items.
  - User-scoped local storage fallback (`patron_watchlist_items_${user.id}`) for instant offline resilience.
- 🛡️ **Admin Vault Control Center (`/admin`)**:
  - Overview metrics for Total Registered Users and Total Saved Media.
  - User registry table with saved item breakdowns (Movies vs Books).
  - One-click `.json` database backup export tool.
- ⚠️ **Account Management**: Self-service account deletion and data wiping controls.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router DOM
- **Backend / Database**: Supabase (Auth + PostgreSQL + RLS)
- **APIs**: OMDb API (movies), Open Library API (books)
- **Styling**: Pure Vanilla CSS design system with HSL dark mode palette

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/AbdellahBouabdli/WatchList-BookList.git
cd WatchList-BookList
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase & OMDb API credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OMDB_API_KEY=your-omdb-api-key
```

### 3. Run Database Migrations

In your [Supabase SQL Editor](https://supabase.com/dashboard), execute the migration scripts in `supabase/migrations/`:

1. `001_create_watchlist_items.sql` - Creates `watchlist_items` table & RLS policies.
2. `002_auth_metadata_notes.sql` - Adds `notes`, `rating` columns, and nickname helper functions.

### 4. Start Local Dev Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
WatchList-BookList/
├── public/
│   └── avatars/             # Dynamic avatar collection (Hannibal, RAD, DMC, SVGs)
├── src/
│   ├── components/          # UI Components
│   │   ├── AdminRoute.tsx          # Admin path protection
│   │   ├── ItemDetailsModal.tsx    # Media details, ratings & comments
│   │   ├── MiniTicket.tsx          # Header patron ticket badge
│   │   ├── ProfileModal.tsx        # Profile & ticket customization
│   │   ├── ProtectedRoute.tsx      # Auth route guard
│   │   ├── SearchResults.tsx       # Media search grid & load pagination
│   │   ├── StarRating.tsx          # Interactive star rating
│   │   └── WatchlistPage.tsx       # Spine queue watchlist view
│   ├── context/             # React Context Providers
│   │   ├── AuthContext.tsx         # Supabase Auth, profiles & roles
│   │   └── WatchlistContext.tsx    # Account-isolated watchlist state
│   ├── lib/                 # API & Supabase Clients
│   │   ├── api.ts                  # OMDb & Open Library API queries
│   │   ├── api-types.ts            # TypeScript definitions
│   │   └── supabase.ts             # Supabase client initialization
│   ├── pages/               # App Views
│   │   ├── AdminDashboardPage.tsx  # Admin Vault Control Center
│   │   ├── LoginPage.tsx           # Ticket admission login
│   │   ├── ResetPasswordPage.tsx   # Passkey reset
│   │   └── SignupPage.tsx          # Patron registration
│   ├── App.css              # Custom retro ticket design tokens
│   └── App.tsx              # Routes & main layout
└── supabase/
    └── migrations/          # SQL Database Migrations
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
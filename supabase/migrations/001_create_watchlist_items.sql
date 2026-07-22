-- Migration: Create watchlist_items table with RLS policies
-- Run this in Supabase SQL Editor or via `supabase db push`

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the watchlist_items table
CREATE TABLE public.watchlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    external_id TEXT NOT NULL,           -- OMDb imdbID or Open Library OLID
    title TEXT NOT NULL,
    poster_url TEXT,                     -- Poster/cover image URL
    type TEXT NOT NULL CHECK (type IN ('movie', 'book')),
    status TEXT NOT NULL DEFAULT 'want_to_watch' CHECK (status IN ('want_to_watch', 'watched')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- 1-5 stars, nullable
    notes TEXT,                          -- Optional personal notes
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Ensure a user can't add the same external item twice
    UNIQUE (user_id, external_id)
);

-- Create indexes for common query patterns
CREATE INDEX idx_watchlist_items_user_id ON public.watchlist_items(user_id);
CREATE INDEX idx_watchlist_items_status ON public.watchlist_items(user_id, status);
CREATE INDEX idx_watchlist_items_type ON public.watchlist_items(user_id, type);
CREATE INDEX idx_watchlist_items_created_at ON public.watchlist_items(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own watchlist items
CREATE POLICY "Users can view their own watchlist items"
    ON public.watchlist_items
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own watchlist items
CREATE POLICY "Users can insert their own watchlist items"
    ON public.watchlist_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own watchlist items
CREATE POLICY "Users can update their own watchlist items"
    ON public.watchlist_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own watchlist items
CREATE POLICY "Users can delete their own watchlist items"
    ON public.watchlist_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_watchlist_items_updated_at
    BEFORE UPDATE ON public.watchlist_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist_items TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
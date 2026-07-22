-- Migration 002: Ensure notes, rating, and metadata fields in Supabase database
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

-- 1. Ensure notes column exists for storing reviews & comments
ALTER TABLE public.watchlist_items 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Ensure rating column exists for storing 1-10 star ratings
ALTER TABLE public.watchlist_items 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 10);

-- 3. Create a helper function to extract user nickname from Supabase Auth metadata
CREATE OR REPLACE FUNCTION public.get_user_nickname(user_meta jsonb)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(user_meta->>'nickname', 'Patron');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create a public view for Admin analytics (optional view for inspection)
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT 
  id AS user_id,
  email,
  public.get_user_nickname(raw_user_meta_data) AS nickname,
  created_at
FROM auth.users;

-- Grant access to public view for authenticated users
GRANT SELECT ON public.admin_user_stats TO authenticated;

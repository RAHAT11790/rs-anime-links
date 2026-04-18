-- Add 24-hour view dedup support: index for fast lookup by ip_hash + link_id + created_at
CREATE INDEX IF NOT EXISTS idx_clicks_dedup ON public.clicks (link_id, ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_user_created ON public.clicks (user_id, created_at DESC);
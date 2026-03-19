-- 1. Create RPC to fetch a single trip by share token (validates token knowledge)
CREATE OR REPLACE FUNCTION public.get_trip_by_share_token(_token uuid)
RETURNS SETOF trips
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM trips
  WHERE share_token = _token
    AND share_enabled = true
  LIMIT 1;
$$;

-- 2. Create RPC to fetch public sections for a trip validated by share token
CREATE OR REPLACE FUNCTION public.get_public_sections_by_share_token(_token uuid)
RETURNS SETOF trip_sections
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ts.* FROM trip_sections ts
  JOIN trips t ON t.id = ts.trip_id
  WHERE t.share_token = _token
    AND t.share_enabled = true
    AND ts.is_public = true
    AND ts.type IN ('itinerary', 'recommendations')
  ORDER BY ts.sort_order;
$$;

-- 3. Drop the overly broad anon policies
DROP POLICY IF EXISTS "Public can view trip by share token" ON trips;
DROP POLICY IF EXISTS "Public can view public sections" ON trip_sections;
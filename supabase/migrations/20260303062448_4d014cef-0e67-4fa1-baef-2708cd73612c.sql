
-- 1. user_profiles: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.user_profiles FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- 2. trips: fix share_token policy to also require share_enabled = true
DROP POLICY IF EXISTS "Public can view trip by share token" ON public.trips;
CREATE POLICY "Public can view trip by share token"
ON public.trips FOR SELECT
USING (share_token IS NOT NULL AND share_enabled = true);

-- 3. trip_crew: remove overly permissive add/remove policies
DROP POLICY IF EXISTS "Users can add crew" ON public.trip_crew;
DROP POLICY IF EXISTS "Users can remove crew" ON public.trip_crew;

-- 4. trip_crew: restrict SELECT to owner or fellow crew members
DROP POLICY IF EXISTS "Users can view crew" ON public.trip_crew;
CREATE POLICY "Users can view crew of their trips"
ON public.trip_crew FOR SELECT TO authenticated
USING (
  trip_id IN (
    SELECT id FROM public.trips WHERE created_by = auth.uid()
  )
  OR trip_id IN (
    SELECT tc.trip_id FROM public.trip_crew tc WHERE tc.user_id = auth.uid()
  )
);

-- 5. message_reactions: restrict SELECT to trip crew/owner
DROP POLICY IF EXISTS "Users can view reactions" ON public.message_reactions;
CREATE POLICY "Crew can view reactions"
ON public.message_reactions FOR SELECT TO authenticated
USING (
  message_id IN (
    SELECT tm.id FROM public.trip_messages tm
    WHERE tm.trip_id IN (
      SELECT id FROM public.trips WHERE created_by = auth.uid()
    )
    OR tm.trip_id IN (
      SELECT tc.trip_id FROM public.trip_crew tc WHERE tc.user_id = auth.uid()
    )
  )
);

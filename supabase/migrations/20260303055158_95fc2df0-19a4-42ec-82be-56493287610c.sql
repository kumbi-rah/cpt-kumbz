
-- 1. Crew can view trips they belong to
CREATE POLICY "Crew can view trips"
ON public.trips
FOR SELECT TO authenticated
USING (
  public.user_can_view_trip(id)
);

-- 2. Crew can view arrivals for their trips
CREATE POLICY "Crew can view arrivals"
ON public.arrivals
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trip_crew
    WHERE trip_crew.trip_id = arrivals.trip_id
    AND trip_crew.user_id = auth.uid()
  )
);

-- 3. Crew can view trip sections
CREATE POLICY "Crew can view sections"
ON public.trip_sections
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trip_crew
    WHERE trip_crew.trip_id = trip_sections.trip_id
    AND trip_crew.user_id = auth.uid()
  )
);

-- 4. Crew can view trip photos
CREATE POLICY "Crew can view photos"
ON public.trip_photos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trip_crew
    WHERE trip_crew.trip_id = trip_photos.trip_id
    AND trip_crew.user_id = auth.uid()
  )
);

-- 5. Crew can upload photos (their own)
CREATE POLICY "Crew can upload photos"
ON public.trip_photos
FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM trip_crew
    WHERE trip_crew.trip_id = trip_photos.trip_id
    AND trip_crew.user_id = auth.uid()
  )
);

-- 6. Crew can delete their own photos
CREATE POLICY "Crew can delete own photos"
ON public.trip_photos
FOR DELETE TO authenticated
USING (
  uploaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM trip_crew
    WHERE trip_crew.trip_id = trip_photos.trip_id
    AND trip_crew.user_id = auth.uid()
  )
);

-- 7. Storage: crew can read files from trip-photos bucket
CREATE POLICY "Crew can read trip photos storage"
ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'trip-photos');

-- 8. Storage: crew can upload files to trip-photos bucket
CREATE POLICY "Crew can upload trip photos storage"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trip-photos');

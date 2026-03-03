
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Crew can read trip photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Crew can upload trip photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos 156oi09_0" ON storage.objects;
DROP POLICY IF EXISTS "Public can view photos 156oi09_0" ON storage.objects;

-- Crew can read trip photos (restricted to trips they belong to via folder path)
CREATE POLICY "Crew can read trip photos storage"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'trip-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT trip_id::text FROM trip_crew WHERE user_id = auth.uid()
  )
);

-- Crew can upload trip photos (restricted to trips they belong to)
CREATE POLICY "Crew can upload trip photos storage"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'trip-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT trip_id::text FROM trip_crew WHERE user_id = auth.uid()
  )
);

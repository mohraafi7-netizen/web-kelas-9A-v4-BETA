-- Storage bucket for member photos
-- Jalankan di Supabase SQL Editor atau via migration

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-photos',
  'member-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: public can view
CREATE POLICY "Public can view member photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'member-photos');

-- Policy: authenticated users can upload
CREATE POLICY "Authenticated users can upload member photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'member-photos');

-- Policy: authenticated users can update
CREATE POLICY "Authenticated users can update member photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'member-photos');

-- Policy: authenticated users can delete
CREATE POLICY "Authenticated users can delete member photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'member-photos');

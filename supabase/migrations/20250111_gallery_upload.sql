-- Gallery upload system
-- Adds storage columns to gallery table and creates gallery bucket

ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS uploaded_by uuid references auth.users(id) on delete set null;

ALTER TABLE public.gallery ALTER COLUMN image_url DROP NOT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view gallery photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update gallery photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete gallery photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

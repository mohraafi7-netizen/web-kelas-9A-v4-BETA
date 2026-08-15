-- Add member photo columns to profiles
-- This replaces the non-existent public.members table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_path TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS attendance_number INTEGER;

-- Storage bucket for member photos
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

-- Policy: only admin/main_admin can upload/update/delete
-- Using a SECURITY DEFINER function for role check to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'main_admin')
  );
$$;

CREATE POLICY "Admins can upload member photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'member-photos' AND public.is_admin_user());

CREATE POLICY "Admins can update member photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'member-photos' AND public.is_admin_user());

CREATE POLICY "Admins can delete member photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'member-photos' AND public.is_admin_user());

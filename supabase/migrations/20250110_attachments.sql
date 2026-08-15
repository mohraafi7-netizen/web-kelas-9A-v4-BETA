-- Attachment system for Galaxy Class
-- Run this in Supabase SQL Editor

-- Task Attachments
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);

-- Project Attachments
CREATE TABLE IF NOT EXISTS public.project_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_project_attachments_project_id ON public.project_attachments(project_id);

-- Announcement Attachments
CREATE TABLE IF NOT EXISTS public.announcement_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_announcement_attachments_announcement_id ON public.announcement_attachments(announcement_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-attachments',
  'task-attachments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-attachments',
  'project-attachments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-attachments',
  'announcement-attachments',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for attachment tables
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_attachments ENABLE ROW LEVEL SECURITY;

-- Task attachments policies
CREATE POLICY "Anyone can view task attachments"
  ON public.task_attachments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert task attachments"
  ON public.task_attachments FOR INSERT
  WITH CHECK (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update task attachments"
  ON public.task_attachments FOR UPDATE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete task attachments"
  ON public.task_attachments FOR DELETE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Project attachments policies
CREATE POLICY "Anyone can view project attachments"
  ON public.project_attachments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert project attachments"
  ON public.project_attachments FOR INSERT
  WITH CHECK (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update project attachments"
  ON public.project_attachments FOR UPDATE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete project attachments"
  ON public.project_attachments FOR DELETE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Announcement attachments policies
CREATE POLICY "Anyone can view announcement attachments"
  ON public.announcement_attachments FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert announcement attachments"
  ON public.announcement_attachments FOR INSERT
  WITH CHECK (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update announcement attachments"
  ON public.announcement_attachments FOR UPDATE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete announcement attachments"
  ON public.announcement_attachments FOR DELETE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Storage policies for task-attachments
CREATE POLICY "Public can view task attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'task-attachments');

CREATE POLICY "Admins can upload task attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'task-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update task attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'task-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete task attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'task-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Storage policies for project-attachments
CREATE POLICY "Public can view project attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'project-attachments');

CREATE POLICY "Admins can upload project attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update project attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete project attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

-- Storage policies for announcement-attachments
CREATE POLICY "Public can view announcement attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'announcement-attachments');

CREATE POLICY "Admins can upload announcement attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'announcement-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update announcement attachments"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'announcement-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete announcement attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'announcement-attachments' and auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

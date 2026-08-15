-- Piket / Duty System
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.piket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  day TEXT NOT NULL,
  student_name TEXT NOT NULL,
  task TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.piket ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Piket is viewable by everyone" ON public.piket;
CREATE POLICY "Piket is viewable by everyone"
  ON public.piket FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert piket" ON public.piket;
CREATE POLICY "Admins can insert piket"
  ON public.piket FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update piket" ON public.piket;
CREATE POLICY "Admins can update piket"
  ON public.piket FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete piket" ON public.piket;
CREATE POLICY "Admins can delete piket"
  ON public.piket FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  );

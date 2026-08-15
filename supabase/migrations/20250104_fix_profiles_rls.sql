-- Fix Profiles RLS: remove recursive admin policy
-- Run this in Supabase SQL Editor

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

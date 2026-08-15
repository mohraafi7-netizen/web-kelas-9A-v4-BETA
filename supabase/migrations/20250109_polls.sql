-- Polls system for Galaxy Class
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.polls (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  is_active boolean default true,
  starts_at text,
  ends_at text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references public.polls(id) on delete cascade not null,
  option_id uuid references public.poll_options(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active polls"
  ON public.polls FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view poll options"
  ON public.poll_options FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view poll votes"
  ON public.poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert polls"
  ON public.polls FOR INSERT
  WITH CHECK (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update polls"
  ON public.polls FOR UPDATE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete polls"
  ON public.polls FOR DELETE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can insert poll options"
  ON public.poll_options FOR INSERT
  WITH CHECK (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can update poll options"
  ON public.poll_options FOR UPDATE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Admins can delete poll options"
  ON public.poll_options FOR DELETE
  USING (auth.uid() in (select id from public.profiles where role in ('admin','main_admin')));

CREATE POLICY "Authenticated users can insert votes"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own votes"
  ON public.poll_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own votes"
  ON public.poll_votes FOR DELETE
  USING (auth.uid() = user_id);

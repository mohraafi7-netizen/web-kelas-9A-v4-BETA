-- Task Completions / Per-user task status
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Task completions are viewable by authenticated users" ON public.task_completions;
CREATE POLICY "Task completions are viewable by authenticated users"
  ON public.task_completions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own completion" ON public.task_completions;
CREATE POLICY "Users can insert own completion"
  ON public.task_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own completion" ON public.task_completions;
CREATE POLICY "Users can delete own completion"
  ON public.task_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

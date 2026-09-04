-- Galaxy Class Message Delete Fix
-- Adds UPDATE RLS policies for chat_messages and private_messages
-- Safe to run multiple times; preserves existing data

-- ============================================================
-- PUBLIC CHAT MESSAGES
-- ============================================================

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own chat messages" ON public.chat_messages;
CREATE POLICY "Users can update own chat messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any chat message" ON public.chat_messages;
CREATE POLICY "Admins can update any chat message"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  );

-- ============================================================
-- PRIVATE MESSAGES
-- ============================================================

ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own private messages" ON public.private_messages;
CREATE POLICY "Users can update own private messages"
  ON public.private_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Admins can update any private message" ON public.private_messages;
CREATE POLICY "Admins can update any private message"
  ON public.private_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'main_admin')
    )
  );

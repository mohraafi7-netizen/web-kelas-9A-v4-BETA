-- Galaxy Class: Unread state for private messages and per-user public chat cursor
-- Safe to run multiple times. No destructive changes.

-- 1) private_messages.read_at
ALTER TABLE public.private_messages
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_private_messages_receiver_unread
  ON public.private_messages (receiver_id, created_at DESC)
  WHERE read_at IS NULL AND deleted_at IS NULL;

DROP POLICY IF EXISTS "Receivers can mark their own messages as read" ON public.private_messages;
CREATE POLICY "Receivers can mark their own messages as read"
  ON public.private_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 2) Per-user public chat cursor: user_chat_state
CREATE TABLE IF NOT EXISTS public.user_chat_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01T00:00:00Z',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_chat_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat state" ON public.user_chat_state;
CREATE POLICY "Users can view own chat state"
  ON public.user_chat_state
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own chat state" ON public.user_chat_state;
CREATE POLICY "Users can upsert own chat state"
  ON public.user_chat_state
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat state" ON public.user_chat_state;
CREATE POLICY "Users can update own chat state"
  ON public.user_chat_state
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

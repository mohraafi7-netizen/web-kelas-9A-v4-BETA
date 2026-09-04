'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

type Reaction = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

type ChatReactionsProps = {
  messageId: string;
  reactions: Reaction[];
  onToggleReaction: (messageId: string, emoji: string) => void;
};

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function ChatReactions({ messageId, reactions, onToggleReaction }: ChatReactionsProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  const grouped = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  return (
    <div className="relative">
      <div className="flex items-center gap-1 mt-1">
        {Object.entries(grouped).map(([emoji, rs]) => (
          <button
            key={emoji}
            onClick={() => onToggleReaction(messageId, emoji)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
          >
            <span>{emoji}</span>
            <span className="text-slate-400">{rs.length}</span>
          </button>
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <span className="text-xs">+</span>
        </button>
      </div>

      {showPicker && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-1 flex items-center gap-1 p-1.5 rounded-xl glass-strong border border-white/10 shadow-lg z-10"
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onToggleReaction(messageId, emoji);
                setShowPicker(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-base transition-colors"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export { ChatReactions };

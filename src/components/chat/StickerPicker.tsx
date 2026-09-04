'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Sticker = {
  id: string;
  url: string;
  emoji?: string;
  name: string;
};

type StickerPack = {
  id: string;
  name: string;
  stickers: Sticker[];
};

const STICKER_PACKS: StickerPack[] = [
  {
    id: 'galaxy',
    name: 'Galaxy',
    stickers: [
      { id: 'g1', url: '/stickers/galaxy/1.webp', emoji: '🚀', name: 'Rocket' },
      { id: 'g2', url: '/stickers/galaxy/2.webp', emoji: '⭐', name: 'Star' },
      { id: 'g3', url: '/stickers/galaxy/3.webp', emoji: '🌌', name: 'Galaxy' },
      { id: 'g4', url: '/stickers/galaxy/4.webp', emoji: '🪐', name: 'Planet' },
      { id: 'g5', url: '/stickers/galaxy/5.webp', emoji: '👾', name: 'Alien' },
      { id: 'g6', url: '/stickers/galaxy/6.webp', emoji: '🛸', name: 'UFO' },
    ],
  },
  {
    id: 'mood',
    name: 'Mood',
    stickers: [
      { id: 'm1', url: '/stickers/mood/1.webp', emoji: '😊', name: 'Happy' },
      { id: 'm2', url: '/stickers/mood/2.webp', emoji: '😂', name: 'Laugh' },
      { id: 'm3', url: '/stickers/mood/3.webp', emoji: '😎', name: 'Cool' },
      { id: 'm4', url: '/stickers/mood/4.webp', emoji: '😢', name: 'Sad' },
      { id: 'm5', url: '/stickers/mood/5.webp', emoji: '😡', name: 'Angry' },
      { id: 'm6', url: '/stickers/mood/6.webp', emoji: '😴', name: 'Sleepy' },
    ],
  },
];

type StickerPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (sticker: Sticker) => void;
};

function StickerPicker({ open, onClose, onSelect }: StickerPickerProps) {
  const [selectedPack, setSelectedPack] = React.useState(STICKER_PACKS[0].id);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full right-0 mb-2 w-80 glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
        >
          <div className="flex items-center gap-1 p-2 border-b border-white/5">
            {STICKER_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  selectedPack === pack.id
                    ? 'bg-galaxy-600/20 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                {pack.name}
              </button>
            ))}
            <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
              ×
            </button>
          </div>
          <div className="p-3 grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {STICKER_PACKS.find((p) => p.id === selectedPack)?.stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onSelect(sticker)}
                className="aspect-square rounded-xl hover:bg-white/5 flex items-center justify-center text-2xl transition-colors"
                title={sticker.name}
              >
                {sticker.emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { StickerPicker };
export type { Sticker, StickerPack };

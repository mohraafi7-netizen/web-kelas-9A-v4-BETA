'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui';
import { Button } from '@/components/ui';

interface LightboxProps {
  open: boolean;
  items: Array<{ id: string; image_url: string; title: string }>;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ open, items, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose, onPrev, onNext]);

  const currentItem = items[currentIndex];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 max-w-5xl w-full"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <OptimizedImage
                src={currentItem?.image_url}
                alt={currentItem?.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button variant="ghost" onClick={onPrev} disabled={currentIndex === 0}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-slate-300 text-sm">
                {currentIndex + 1} / {items.length}
              </span>
              <Button variant="ghost" onClick={onNext} disabled={currentIndex === items.length - 1}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <button
              onClick={onClose}
              className="absolute -top-10 right-0 p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Lightbox };

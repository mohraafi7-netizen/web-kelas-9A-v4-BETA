'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'danger' | 'warning';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: Variant;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<Variant, { iconBg: string; iconColor: string; confirmBg: string }> = {
  default: {
    iconBg: 'bg-galaxy-600/10 border-galaxy-500/10',
    iconColor: 'text-galaxy-400',
    confirmBg: 'bg-galaxy-600 hover:bg-galaxy-500 text-white',
  },
  danger: {
    iconBg: 'bg-red-500/10 border-red-500/20',
    iconColor: 'text-red-400',
    confirmBg: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white',
  },
  warning: {
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    confirmBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white',
  },
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Batal',
  loading = false,
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const confirmRef = React.useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, loading, onCancel]);

  React.useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => confirmRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevWidth = document.body.style.width;
    const prevTop = document.body.style.top;
    const scrollY = window.scrollY;

    document.body.style.overflow = 'hidden';
    if (scrollY > 0) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [open]);

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => !loading && onCancel()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full sm:max-w-md',
              'glass-strong border border-white/10 shadow-2xl',
              'rounded-t-3xl sm:rounded-2xl',
              'flex flex-col',
              'max-h-[100dvh] sm:max-h-[85dvh]'
            )}
          >
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3 sm:mb-4">
                <div className={cn('p-2.5 rounded-xl border shrink-0', styles.iconBg)}>
                  {variant === 'danger' ? (
                    <Trash2 className={cn('w-5 h-5', styles.iconColor)} />
                  ) : (
                    <AlertCircle className={cn('w-5 h-5', styles.iconColor)} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 id="confirm-dialog-title" className="text-base sm:text-lg font-semibold text-white">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed break-words">{description}</p>
                  )}
                </div>
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white shrink-0 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="shrink-0 border-t border-white/10 px-5 sm:px-6 pt-3 pb-4 sm:pb-5"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </button>
                <button
                  ref={confirmRef}
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg',
                    styles.confirmBg
                  )}
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}

export { ConfirmDialog };
export type { ConfirmDialogProps, Variant };

'use client';

import * as React from 'react';
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
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && onCancel()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-5 sm:p-6">
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
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">{description}</p>
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

              <div className="flex flex-col-reverse sm:flex-row gap-2 mt-5">
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
}

export { ConfirmDialog };
export type { ConfirmDialogProps, Variant };

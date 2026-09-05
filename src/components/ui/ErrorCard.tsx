'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorCardProps) {
  return (
    <div
      role="alert"
      className={cn(
        'glass rounded-2xl border border-red-500/20 p-5 sm:p-6 text-center',
        className
      )}
    >
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-slate-400 mb-4 break-words">{message}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-galaxy-600 hover:bg-galaxy-500 text-white text-sm font-medium transition-colors min-h-[40px]"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export { ErrorCard };

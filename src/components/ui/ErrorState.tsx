'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({ title = 'Something went wrong', message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {message && <p className="text-slate-400 mb-6 max-w-md">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-full bg-galaxy-600 hover:bg-galaxy-500 text-white font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export { ErrorState };

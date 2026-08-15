import * as React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuickAccessCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function QuickAccessCard({ href, icon, title, description, className }: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'glass-strong rounded-2xl p-5 transition-all duration-300 hover:border-galaxy-500/30 hover:-translate-y-1 group block',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10 text-galaxy-400 group-hover:scale-110 transition-transform duration-300 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-galaxy-300 transition-colors truncate">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export { QuickAccessCard };

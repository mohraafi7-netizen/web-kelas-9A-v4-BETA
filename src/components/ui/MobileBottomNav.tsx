'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image as ImageIcon, Calendar, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const bottomNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: User },
];

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-white/5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]',
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/members"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]',
            pathname === '/members' ? 'text-white' : 'text-slate-400 hover:text-white'
          )}
        >
          <User className="w-5 h-5" strokeWidth={pathname === '/members' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Members</span>
        </Link>
      </div>
    </nav>
  );
}

export { MobileBottomNav };

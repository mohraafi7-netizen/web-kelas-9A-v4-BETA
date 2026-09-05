'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, MessageCircle, Users, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnread } from '@/providers/UnreadNotificationsProvider';
import { UnreadBadge } from '@/components/ui/UnreadBadge';

const bottomNavItems = [
  { href: '/', label: 'Home', icon: Home, key: 'home' as const },
  { href: '/hub', label: 'Hub', icon: CalendarDays, key: 'hub' as const },
  { href: '/chat', label: 'Chat', icon: MessageCircle, key: 'chat' as const },
  { href: '/messages', label: 'Messages', icon: Mail, key: 'messages' as const },
  { href: '/members', label: 'Members', icon: Users, key: 'members' as const },
];

function MobileBottomNav() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const { publicUnread, privateUnread } = useUnread();

  if (isAdminRoute) return null;

  const badgeFor = (key: typeof bottomNavItems[number]['key']) => {
    if (key === 'chat') return publicUnread;
    if (key === 'messages') return privateUnread;
    return 0;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-16">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          const count = badgeFor(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] min-h-[44px] flex-1',
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <span className="relative">
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5">
                    <UnreadBadge count={count} size="sm" />
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileBottomNav };


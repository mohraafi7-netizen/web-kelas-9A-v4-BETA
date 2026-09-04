'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { canViewAdminPanel } from '@/lib/auth/permissions';
import { useRouter } from 'next/navigation';

  const mainNavItems = [
    { href: '/', label: 'Home' },
    { href: '/hub', label: 'Class Hub' },
    { href: '/members', label: 'Members' },
    { href: '/chat', label: 'Chat' },
    { href: '/profile', label: 'Profile' },
  ];

  const featureNavItems = [
    { href: '/schedule', label: 'Schedule' },
    { href: '/duty', label: 'Piket' },
    { href: '/announcements', label: 'Announcements' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/projects', label: 'Projects' },
    { href: '/voting', label: 'Voting' },
    { href: '/ranking', label: 'Ranking' },
    { href: '/birthdays', label: 'Birthdays' },
    { href: '/poetry', label: 'Poetry' },
    { href: '/events', label: 'Events' },
    { href: '/settings', label: 'Settings' },
  ];

function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showAdminLink = canViewAdminPanel(profile?.role);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'p-2' : 'p-4'} md:hidden`}>
      <div className="mx-auto max-w-7xl">
        <div className={`glass-nav rounded-2xl transition-all duration-500 ${scrolled ? 'shadow-lg shadow-black/30 bg-space-navy/80' : 'shadow-lg shadow-black/20'}`}>
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-galaxy-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-[2px] rounded-full bg-space-navy" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/90" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight hidden sm:block">
                GALAXY CLASS
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="md:hidden p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-2 glass-strong rounded-2xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      pathname === item.href
                        ? 'bg-galaxy-600/20 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 pb-1 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Academic
                </div>
                {featureNavItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      pathname === item.href
                        ? 'bg-galaxy-600/20 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 pb-1 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  More
                </div>
                {featureNavItems.slice(4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      pathname === item.href
                        ? 'bg-galaxy-600/20 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2">
                  {showAdminLink ? (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-xl btn-cosmic text-white text-sm font-medium"
                    >
                      Admin Tools
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-xl btn-cosmic text-white text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export { Navbar };

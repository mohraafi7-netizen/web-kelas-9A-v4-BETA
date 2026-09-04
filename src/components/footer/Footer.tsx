import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Instagram, MessageCircle } from 'lucide-react';
import { ClassSocialMedia } from '@/components/social/ClassSocialMedia';

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-cosmic-900/30 backdrop-blur-sm pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-galaxy-600 to-purple-600 opacity-80" />
              <div className="absolute inset-[2px] rounded-full bg-cosmic-900" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/90" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GALAXY CLASS
            </span>
          </div>

          <div className="flex items-center gap-6">
            <ClassSocialMedia />
            <span className="text-sm text-slate-400">
              © {new Date().getFullYear()} Galaxy Class. All rights reserved.
            </span>
          </div>

          <div className="flex gap-6">
            {['About', 'Members', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };

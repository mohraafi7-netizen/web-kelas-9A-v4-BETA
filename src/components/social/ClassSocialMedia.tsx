import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';
import { socialLinks } from '@/data/socialLinks';

function ClassSocialMedia() {
  const hasSocial = socialLinks.instagram || socialLinks.tiktok;

  if (!hasSocial) return null;

  return (
    <div className="flex items-center gap-3">
      {socialLinks.instagram && (
        <Link
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Follow us on Instagram"
        >
          <Instagram className="w-5 h-5" />
        </Link>
      )}
      {socialLinks.tiktok && (
        <Link
          href={socialLinks.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl glass hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Follow us on TikTok"
        >
          <MessageCircle className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}

export { ClassSocialMedia };

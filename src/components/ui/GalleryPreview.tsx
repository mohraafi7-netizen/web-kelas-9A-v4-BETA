import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { Image, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GalleryPreviewProps {
  images?: { title: string; color: string }[];
}

function GalleryPreview({ images }: GalleryPreviewProps) {
  const defaultImages = [
    { title: 'Science Fair 2024', color: 'from-purple-500/20 to-blue-500/20' },
    { title: 'Sports Day', color: 'from-blue-500/20 to-cyan-500/20' },
    { title: 'Class Trip', color: 'from-pink-500/20 to-purple-500/20' },
    { title: 'Graduation Day', color: 'from-cyan-500/20 to-blue-500/20' },
  ];

  const displayImages = images && images.length > 0 ? images : defaultImages;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Gallery Preview</h3>
        <Link href="/gallery" className="text-xs text-galaxy-400 hover:text-galaxy-300 transition-colors flex items-center gap-1">
          Open Gallery <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {displayImages.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className={`aspect-square rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer`}
          >
            <Image className="w-5 h-5 text-white/50" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export { GalleryPreview };

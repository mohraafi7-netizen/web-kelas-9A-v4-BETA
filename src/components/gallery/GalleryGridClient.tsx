'use client';

import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { OptimizedImage } from '@/components/ui';
import { Lightbox } from '@/components/gallery/Lightbox';

function GalleryGridClient({ items }: { items: Array<{ id: string; image_url: string; title: string; category: string | null }> }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <GlassCard key={item.id} hover className="overflow-hidden p-0 cursor-pointer" onClick={() => { setCurrentIndex(index); setLightboxOpen(true); }}>
            <div className="relative aspect-video">
              <OptimizedImage
                src={item.image_url}
                alt={item.title}
                fill
                className="rounded-t-2xl"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white mb-1">{item.title}</h3>
              <span className="text-xs text-galaxy-400">{item.category || 'General'}</span>
            </div>
          </GlassCard>
        ))}
      </div>
      <Lightbox
        items={items}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
      />
    </>
  );
}

export { GalleryGridClient };

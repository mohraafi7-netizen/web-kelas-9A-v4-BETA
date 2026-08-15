'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { OptimizedImage } from '@/components/ui';
import { Lightbox } from '@/components/gallery/Lightbox';
import { Image } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';

type GalleryItem = {
  id: string;
  image_url: string | null;
  title: string;
  category: string | null;
  storage_path: string | null;
  created_at: string;
};

function GalleryGridClient({ items }: { items: GalleryItem[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const src = item.storage_path ? storage.getPublicUrl('gallery', item.storage_path) : (item.image_url || '/placeholder-project.jpg');
          return (
            <GlassCard key={item.id} hover className="overflow-hidden p-0 cursor-pointer" onClick={() => { setCurrentIndex(index); setLightboxOpen(true); }}>
              <div className="relative aspect-video">
                <OptimizedImage
                  src={src}
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
          );
        })}
      </div>
      <Lightbox
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          image_url: item.storage_path ? storage.getPublicUrl('gallery', item.storage_path) : (item.image_url || '/placeholder-project.jpg'),
        }))}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
      />
    </>
  );
}

export default function GalleryPage() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchGallery = async () => {
      try {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (data) setItems(data as GalleryItem[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();

    const channel = supabase
      .channel('gallery-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchGallery();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen">
      <Section
        title="COSMIC ARCHIVE"
        subtitle="Memories from our class events and activities."
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="overflow-hidden p-0">
                <div className="relative aspect-video bg-slate-800 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                  <div className="h-5 bg-slate-700/50 rounded w-3/4" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No gallery items yet"
            description="Photos and memories will appear here as they are uploaded."
            action={<Image className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <GalleryGridClient items={items} />
        )}
      </Section>
    </main>
  );
}

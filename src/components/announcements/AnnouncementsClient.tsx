'use client';

import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { AnnouncementsSearch } from '@/components/announcements/AnnouncementsSearch';
import { AnnouncementItem } from '@/components/announcements/AnnouncementItem';
import type { Announcement, AnnouncementAttachment } from '@/types';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';

function AnnouncementsClient({ announcements }: { announcements?: Announcement[] }) {
  const [items, setItems] = React.useState<Announcement[]>(announcements ?? []);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(!announcements);
  const [attachmentsMap, setAttachmentsMap] = React.useState<Record<string, AnnouncementAttachment[]>>({});

  React.useEffect(() => {
    if (announcements) {
      setItems(announcements);
      setLoading(false);
    }
  }, [announcements]);

  React.useEffect(() => {
    if (announcements) return;

    const supabase = createClientSupabaseBrowser();

    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchAnnouncements();

    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as Announcement, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Announcement) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [announcements]);

  React.useEffect(() => {
    const fetchAttachments = async () => {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('announcement_attachments').select('*').in('announcement_id', items.map((i) => i.id));
      if (data) {
        const map: Record<string, AnnouncementAttachment[]> = {};
        for (const att of data) {
          if (!map[att.announcement_id]) map[att.announcement_id] = [];
          map[att.announcement_id].push(att);
        }
        setAttachmentsMap(map);
      }
    };
    if (items.length > 0) fetchAttachments();
  }, [items]);

  const filtered = items.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-slate-700/50 rounded w-3/4" />
              <div className="h-4 bg-slate-700/50 rounded w-full" />
              <div className="h-4 bg-slate-700/50 rounded w-1/2" />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <>
      <AnnouncementsSearch onSearch={setSearch} />
      <div className="max-w-3xl mx-auto space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-12">No announcements found.</div>
        ) : (
          filtered.map((announcement) => (
            <AnnouncementItem
              key={announcement.id}
              announcement={announcement}
              attachments={attachmentsMap[announcement.id] || []}
            />
          ))
        )}
      </div>
    </>
  );
}

export { AnnouncementsClient };

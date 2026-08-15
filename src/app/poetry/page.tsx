import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { PenLine } from 'lucide-react';

export const metadata = {
  title: 'Words & Poetry - Galaxy Class',
  description: 'Share and read poems, quotes, and messages from our class.',
};

interface PoetryItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category?: string;
  created_at: string;
}

async function getPoetry() {
  try {
    const supabase = createClientSupabaseBrowser();
    const { data, error } = await supabase
      .from('poetry')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as PoetryItem[];
  } catch {
    return [];
  }
}

export default async function PoetryPage() {
  const items = await getPoetry();

  return (
    <main className="min-h-screen">
      <Section title="Words & Poetry" subtitle="Poems, quotes, and messages from our class.">
        {items.length === 0 ? (
          <EmptyState
            title="No words yet"
            description="Poems and messages will appear here once shared."
            action={<PenLine className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <GlassCard key={item.id} hover className="p-6 group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-galaxy-400 font-medium px-2 py-1 rounded-full bg-galaxy-600/10 border border-galaxy-500/10">
                    {item.category || 'Words'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-galaxy-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{item.content}</p>
                <p className="text-xs text-slate-500 mt-4">— {item.author_name}</p>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}

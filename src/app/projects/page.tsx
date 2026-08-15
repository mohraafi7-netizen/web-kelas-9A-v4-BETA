'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { OptimizedImage } from '@/components/ui';
import { FolderOpen, Paperclip, Download } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import type { Project, ProjectAttachment } from '@/types';

function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [attachmentsMap, setAttachmentsMap] = React.useState<Record<string, ProjectAttachment[]>>({});

  React.useEffect(() => {
    const fetchAttachments = async () => {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('project_attachments').select('*').in('project_id', projects.map((p) => p.id));
      if (data) {
        const map: Record<string, ProjectAttachment[]> = {};
        for (const att of data) {
          if (!map[att.project_id]) map[att.project_id] = [];
          map[att.project_id].push(att);
        }
        setAttachmentsMap(map);
      }
    };
    if (projects.length > 0) fetchAttachments();
  }, [projects]);

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Class projects will appear here once they are published."
        action={<FolderOpen className="w-12 h-12 text-galaxy-400" />}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {projects.map((project) => {
          const projectAttachments = attachmentsMap[project.id] || [];
          return (
            <GlassCard key={project.id} hover className="overflow-hidden p-0 group">
              <div className="relative aspect-video overflow-hidden">
                <OptimizedImage
                  src={project.image_url || '/placeholder-project.jpg'}
                  alt={project.title}
                  fill
                  className="rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs text-galaxy-400 font-medium mb-2 block">{project.category || 'Project'}</span>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-galaxy-300 transition-colors">{project.title}</h3>
                <p className="text-slate-400 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                {project.link && (
                  <a
                    href={project.link}
                    className="inline-flex items-center text-sm text-galaxy-400 hover:text-galaxy-300 transition-colors"
                  >
                    View Project →
                  </a>
                )}
                {projectAttachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {projectAttachments.map((att) => (
                      <a
                        key={att.id}
                        href={storage.getPublicUrl('project-attachments', att.storage_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-galaxy-500/50 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300 truncate flex-1">{att.file_name}</span>
                        <span className="text-xs text-slate-500">{storage.formatFileSize(att.file_size)}</span>
                        <Download className="w-4 h-4 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchProjects = async () => {
      try {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data) setProjects(data as Project[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen">
      <Section
        title="GALAXY PROJECTS"
        subtitle="Explore the amazing projects created by Galaxy Class."
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <GlassCard key={i} className="overflow-hidden p-0">
                <div className="relative aspect-video bg-slate-800 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-1/4" />
                  <div className="h-6 bg-slate-700/50 rounded w-3/4" />
                  <div className="h-4 bg-slate-700/50 rounded w-full" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <ProjectsGrid projects={projects} />
        )}
      </Section>
    </main>
  );
}

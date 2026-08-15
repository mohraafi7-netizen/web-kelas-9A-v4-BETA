'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Modal } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  BookOpen,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  SortAsc,
  X,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import type { Task, TaskAttachment } from '@/types';

type Piket = {
  id: string;
  date: string;
  day: string;
  student_name: string;
  task: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

function ConfirmDialog({ open, onClose, onConfirm, title, description }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-slate-300 mb-6">{description}</p>
      <div className="flex items-center justify-end gap-3">
        <GalaxyButton variant="secondary" onClick={onClose}>Cancel</GalaxyButton>
        <GalaxyButton onClick={onConfirm} icon={<Trash2 className="w-4 h-4" />}>Delete</GalaxyButton>
      </div>
    </Modal>
  );
}

function AttachmentPreview({ attachment, onRemove, canRemove }: { attachment: TaskAttachment; onRemove?: () => void; canRemove?: boolean }) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (storage.isImage(attachment.file_type)) {
      setPreviewUrl(storage.getPublicUrl('task-attachments', attachment.storage_path));
    }
  }, [attachment]);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
      {previewUrl && !error ? (
        <img
          src={previewUrl}
          alt={attachment.file_name}
          className="w-10 h-10 object-cover rounded-lg"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700">
          {storage.isPdf(attachment.file_type) ? (
            <FileText className="w-5 h-5 text-red-400" />
          ) : (
            <Paperclip className="w-5 h-5 text-slate-400" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{attachment.file_name}</p>
        <p className="text-xs text-slate-500">{storage.formatFileSize(attachment.file_size)}</p>
      </div>
      <a
        href={previewUrl || storage.getPublicUrl('task-attachments', attachment.storage_path)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        title="Download / Open"
      >
        <Download className="w-4 h-4" />
      </a>
      {canRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
          title="Remove attachment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function TaskCard({ task, attachments, onComplete, onDelete, canEdit, isCompletedByMe, onRemoveAttachment }: { task: Task; attachments: TaskAttachment[]; onComplete: (id: string) => void; onDelete: (id: string) => void; canEdit: boolean; isCompletedByMe: boolean; onRemoveAttachment?: (taskId: string, attachmentId: string) => void }) {
  const getStatusBadge = () => {
    switch (task.status) {
      case 'completed':
        return <GalaxyBadge variant="success">Completed</GalaxyBadge>;
      case 'expired':
        return <GalaxyBadge variant="danger">Expired</GalaxyBadge>;
      default:
        return <GalaxyBadge variant="warning">Active</GalaxyBadge>;
    }
  };

  const getDeadlineStatus = () => {
    if (!task.deadline) return null;
    const deadline = new Date(task.deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (task.status === 'completed') return null;
    if (diff < 0) return <span className="text-xs text-red-400">Deadline passed</span>;
    if (days === 0 && hours < 24) return <span className="text-xs text-amber-400">Due in {hours} hours</span>;
    if (days === 1) return <span className="text-xs text-amber-400">Due tomorrow</span>;
    return <span className="text-xs text-slate-400">Due in {days} days</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <GlassCard hover className="p-6 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                {task.title}
              </h3>
              {getStatusBadge()}
            </div>

            {task.description && (
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {task.subject && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{task.subject}</span>
                </div>
              )}
              {task.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              )}
              {getDeadlineStatus() && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {getDeadlineStatus()}
                </div>
              )}
              {attachments.length > 0 && (
                <div className="flex items-center gap-1 text-galaxy-400">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{attachments.length} attachment{attachments.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att) => (
                  <AttachmentPreview
                    key={att.id}
                    attachment={att}
                    canRemove={canEdit}
                    onRemove={onRemoveAttachment ? () => onRemoveAttachment(task.id, att.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!canEdit && task.status === 'active' && (
              <button
                onClick={() => onComplete(task.id)}
                className={`p-2 rounded-lg transition-colors ${isCompletedByMe ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-emerald-500/10 text-emerald-400'}`}
                title={isCompletedByMe ? 'Undo complete' : 'Mark as complete'}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            {canEdit && task.status === 'active' && (
              <>
                <button
                  onClick={() => onComplete(task.id)}
                  className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                  title="Mark as complete"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function TasksPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [completions, setCompletions] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', description: '', subject: '', deadline: '' });
  const [search, setSearch] = React.useState('');
  const [subjectFilter, setSubjectFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<'deadline' | 'created'>('deadline');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [attachmentsMap, setAttachmentsMap] = React.useState<Record<string, TaskAttachment[]>>({});
  const [uploadingTaskId, setUploadingTaskId] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const canEdit = profile?.role === 'admin' || profile?.role === 'main_admin';

  const fetchAttachments = React.useCallback(async (taskId: string) => {
    try {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('task_attachments').select('*').eq('task_id', taskId).order('created_at', { ascending: true });
      if (data) {
        setAttachmentsMap((prev) => ({ ...prev, [taskId]: data }));
      }
    } catch {
      // silent
    }
  }, []);

  const fetchAllAttachments = React.useCallback(async (taskIds: string[]) => {
    const supabase = createClientSupabaseBrowser();
    const { data } = await supabase.from('task_attachments').select('*').in('task_id', taskIds);
    if (data) {
      const map: Record<string, TaskAttachment[]> = {};
      for (const att of data) {
        if (!map[att.task_id]) map[att.task_id] = [];
        map[att.task_id].push(att);
      }
      setAttachmentsMap((prev) => ({ ...prev, ...map }));
    }
  }, []);

  const fetchTasks = React.useCallback(async () => {
    try {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (data) {
        setTasks(data as Task[]);
        const taskIds = data.map((t) => t.id);
        if (taskIds.length > 0) {
          fetchAllAttachments(taskIds);
        }
      }
    } catch (error) {
      showToast('error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [showToast, fetchAllAttachments]);

  const fetchCompletions = React.useCallback(async () => {
    if (!profile) return;
    try {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('task_completions').select('task_id').eq('user_id', profile.id);
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((c: { task_id: string }) => { map[c.task_id] = true; });
        setCompletions(map);
      }
    } catch {
      // silent
    }
  }, [profile]);

  React.useEffect(() => {
    fetchTasks();
    fetchCompletions();
  }, [fetchTasks, fetchCompletions]);

  React.useEffect(() => {
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_completions' }, () => {
        fetchCompletions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchTasks, fetchCompletions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const supabase = createClientSupabaseBrowser();
    let taskId: string | undefined;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: form.title,
          description: form.description,
          subject: form.subject,
          deadline: form.deadline || null,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      taskId = data.id as string;

      if (selectedFile && taskId) {
        setUploadingTaskId(taskId);
        const path = storage.generatePath('tasks', taskId, selectedFile.name);
        const { error: uploadError } = await supabase.storage.from('task-attachments').upload(path, selectedFile, {
          upsert: true,
          contentType: selectedFile.type,
          cacheControl: '3600',
        });

        if (uploadError) throw uploadError;

        const publicUrl = storage.getPublicUrl('task-attachments', path);

        const { error: attachError } = await supabase.from('task_attachments').insert({
          task_id: taskId,
          file_name: selectedFile.name,
          storage_path: path,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          uploaded_by: profile?.id || null,
        });

        if (attachError) throw attachError;

        setAttachmentsMap((prev) => {
          const key = taskId as string;
          return {
            ...prev,
            [key]: [
              ...(prev[key] || []),
              {
                id: '',
                task_id: key,
                file_name: selectedFile.name,
                storage_path: path,
                file_type: selectedFile.type,
                file_size: selectedFile.size,
                uploaded_by: profile?.id || null,
                created_at: new Date().toISOString(),
              },
            ],
          };
        });
      }

      showToast('success', 'Task created successfully');
      setForm({ title: '', description: '', subject: '', deadline: '' });
      setSelectedFile(null);
      setShowCreate(false);
      fetchTasks();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setUploadingTaskId(null);
    }
  };

  const handleRemoveAttachment = async (taskId: string, attachmentId: string) => {
    const attachment = attachmentsMap[taskId]?.find((a) => a.id === attachmentId);
    if (!attachment) return;

    try {
      const supabase = createClientSupabaseBrowser();
      const { error: storageError } = await supabase.storage.from('task-attachments').remove([attachment.storage_path]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('task_attachments').delete().eq('id', attachmentId);
      if (dbError) throw dbError;

      setAttachmentsMap((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).filter((a) => a.id !== attachmentId),
      }));
      showToast('success', 'Attachment removed');
    } catch {
      showToast('error', 'Failed to remove attachment');
    }
  };

  const handleComplete = async (id: string) => {
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();
    const { data: existing } = await supabase.from('task_completions').select('*').eq('task_id', id).eq('user_id', profile.id).maybeSingle();

    if (existing) {
      const { error } = await supabase.from('task_completions').delete().eq('id', existing.id);
      if (error) {
        showToast('error', 'Failed to undo completion');
      } else {
        showToast('success', 'Completion undone');
        fetchCompletions();
      }
    } else {
      const { error } = await supabase.from('task_completions').insert({ task_id: id, user_id: profile.id });
      if (error) {
        showToast('error', 'Failed to mark complete');
      } else {
        showToast('success', 'Task completed!');
        fetchCompletions();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      showToast('error', 'Failed to delete task');
    } else {
      showToast('success', 'Task deleted');
      setDeleteId(null);
      fetchTasks();
    }
  };

  const subjects = Array.from(new Set(tasks.map(t => t.subject).filter((s): s is string => Boolean(s))));

  let filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || t.subject === subjectFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  if (sortBy === 'deadline') {
    filtered = [...filtered].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />

      <Section title="TASKS" subtitle="Manage your assignments and deadlines." className="relative z-10">
        <div className="relative">
          <GalaxyGlow size="lg" color="purple" className="top-0 right-0 opacity-20" />

          {canEdit && (
            <div className="mb-6">
              <GalaxyButton onClick={() => setShowCreate(!showCreate)} icon={<Plus className="w-4 h-4" />}>
                {showCreate ? 'Cancel' : 'Create Task'}
              </GalaxyButton>
            </div>
          )}

          {showCreate && canEdit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <GlassCard className="p-6">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      placeholder="Task description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                        placeholder="e.g. Math"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
                      <input
                        type="datetime-local"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Attachment</label>
                    <input
                      type="file"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept={storage.getAllowedMimeTypes().join(',')}
                    />
                    {selectedFile && (
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedFile.name} ({storage.formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                  <GalaxyButton type="submit" icon={<CheckCircle className="w-4 h-4" />} disabled={uploadingTaskId !== null}>
                    {uploadingTaskId !== null ? 'Creating...' : 'Create Task'}
                  </GalaxyButton>
                </form>
              </GlassCard>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
              <button
                onClick={() => setSortBy(sortBy === 'deadline' ? 'created' : 'deadline')}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800 transition-colors"
                title={`Sort by ${sortBy === 'deadline' ? 'created' : 'deadline'}`}
              >
                <SortAsc className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
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
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Belum ada tugas"
              description="Tasks and assignments will appear here."
              action={<CheckSquare className="w-12 h-12 text-galaxy-400" />}
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  attachments={attachmentsMap[task.id] || []}
                  onComplete={handleComplete}
                  onDelete={(id) => setDeleteId(id)}
                  canEdit={canEdit}
                  isCompletedByMe={!!completions[task.id]}
                  onRemoveAttachment={handleRemoveAttachment}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </main>
  );
}

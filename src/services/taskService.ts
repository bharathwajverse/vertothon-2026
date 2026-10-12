import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskPriority, TaskStatus } from '../types';
import { logAuditEvent } from './auditService';

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  createdBy?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

const TASKS_STORAGE_KEY = 'vertothon_tasks_cache_v1';

function getCachedTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateCachedTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota
  }
}

export function mapDatabaseRowToTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    description: row.description ? String(row.description) : undefined,
    assignedTo: row.assigned_to ? String(row.assigned_to) : undefined,
    dueDate: row.due_date ? String(row.due_date) : undefined,
    priority: (row.priority as TaskPriority) || 'medium',
    status: (row.status as TaskStatus) || 'pending',
    createdBy: row.created_by ? String(row.created_by) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    assignee: row.assignee && typeof row.assignee === 'object' ? {
      id: String((row.assignee as Record<string, unknown>).id || ''),
      email: String((row.assignee as Record<string, unknown>).email || ''),
      fullName: String((row.assignee as Record<string, unknown>).full_name || ''),
      role: 'volunteer',
      registrationStatus: 'approved',
      createdAt: '',
    } : undefined,
  };
}

export async function fetchTasks(statusFilter?: TaskStatus | 'all'): Promise<{ data: Task[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    let cached = getCachedTasks();
    if (statusFilter && statusFilter !== 'all') {
      cached = cached.filter((t) => t.status === statusFilter);
    }
    return { data: cached, error: null };
  }

  try {
    let query = supabase
      .from('tasks')
      .select('*, assignee:profiles!assigned_to(id, full_name, email)')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      let cached = getCachedTasks();
      if (statusFilter && statusFilter !== 'all') {
        cached = cached.filter((t) => t.status === statusFilter);
      }
      return { data: cached, error: new Error(error.message) };
    }

    const tasks = (data || []).map(mapDatabaseRowToTask);
    updateCachedTasks(tasks);
    return { data: tasks, error: null };
  } catch (err) {
    return {
      data: getCachedTasks(),
      error: err instanceof Error ? err : new Error('Failed to fetch tasks'),
    };
  }
}

export async function createTask(
  input: CreateTaskInput,
  actorId?: string
): Promise<{ data: Task | null; error: Error | null }> {
  const localTask: Task = {
    id: `task-${Date.now()}`,
    title: input.title.trim(),
    description: input.description?.trim(),
    assignedTo: input.assignedTo,
    dueDate: input.dueDate,
    priority: input.priority || 'medium',
    status: input.status || 'pending',
    createdBy: actorId,
    createdAt: new Date().toISOString(),
  };

  const cached = getCachedTasks();
  updateCachedTasks([localTask, ...cached]);

  if (!isSupabaseConfigured) {
    return { data: localTask, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        assigned_to: input.assignedTo || null,
        due_date: input.dueDate || null,
        priority: input.priority || 'medium',
        status: input.status || 'pending',
        created_by: actorId || null,
      })
      .select('*, assignee:profiles!assigned_to(id, full_name, email)')
      .single();

    if (error) {
      return { data: localTask, error: new Error(error.message) };
    }

    const saved = mapDatabaseRowToTask(data);
    const existing = getCachedTasks().filter((t) => t.id !== localTask.id);
    updateCachedTasks([saved, ...existing]);

    void logAuditEvent('task_created', 'task', saved.id, { title: saved.title, priority: saved.priority }, actorId);

    return { data: saved, error: null };
  } catch (err) {
    return { data: localTask, error: err instanceof Error ? err : new Error('Failed to create task') };
  }
}

export async function updateTask(
  taskId: string,
  updates: UpdateTaskInput,
  actorId?: string
): Promise<{ data: Task | null; error: Error | null }> {
  const cached = getCachedTasks();
  const existingIdx = cached.findIndex((t) => t.id === taskId);
  let updatedTask: Task | null = null;

  if (existingIdx !== -1) {
    cached[existingIdx] = {
      ...cached[existingIdx],
      ...updates,
      assignedTo: updates.assignedTo !== undefined ? (updates.assignedTo || undefined) : cached[existingIdx].assignedTo,
      dueDate: updates.dueDate !== undefined ? (updates.dueDate || undefined) : cached[existingIdx].dueDate,
      updatedAt: new Date().toISOString(),
    };
    updatedTask = cached[existingIdx];
    updateCachedTasks([...cached]);
  }

  if (!isSupabaseConfigured) {
    return { data: updatedTask, error: null };
  }

  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description?.trim() || null;
    if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo || null;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .select('*, assignee:profiles!assigned_to(id, full_name, email)')
      .single();

    if (error) {
      return { data: updatedTask, error: new Error(error.message) };
    }

    const saved = mapDatabaseRowToTask(data);
    void logAuditEvent('task_updated', 'task', taskId, { ...updates }, actorId);
    return { data: saved, error: null };
  } catch (err) {
    return { data: updatedTask, error: err instanceof Error ? err : new Error('Failed to update task') };
  }
}

export async function deleteTask(
  taskId: string,
  actorId?: string
): Promise<{ success: boolean; error: Error | null }> {
  const cached = getCachedTasks().filter((t) => t.id !== taskId);
  updateCachedTasks(cached);

  if (!isSupabaseConfigured) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) return { success: false, error: new Error(error.message) };

    void logAuditEvent('task_deleted', 'task', taskId, {}, actorId);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Failed to delete task') };
  }
}

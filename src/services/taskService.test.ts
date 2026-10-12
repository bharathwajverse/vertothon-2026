import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import * as supabaseModule from '../lib/supabase';

describe('Task Management Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('creates an operational task and stores in cache when offline', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const res = await createTask(
      {
        title: 'Calibrate venue Wi-Fi routers',
        description: 'Ensure 5GHz SSID is assigned for team hacking bays',
        priority: 'urgent',
        dueDate: '2026-11-14',
      },
      'lead-org-1'
    );

    expect(res.data).not.toBeNull();
    expect(res.data?.title).toBe('Calibrate venue Wi-Fi routers');
    expect(res.data?.priority).toBe('urgent');
    expect(res.data?.status).toBe('pending');

    const listRes = await fetchTasks();
    expect(listRes.data.length).toBe(1);
    expect(listRes.data[0].title).toBe('Calibrate venue Wi-Fi routers');
  });

  it('updates task status through pending -> in_progress -> completed workflow', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const created = await createTask({
      title: 'Print participant credentials',
      priority: 'high',
    });

    const taskId = created.data!.id;

    const inProgressRes = await updateTask(taskId, { status: 'in_progress' });
    expect(inProgressRes.data?.status).toBe('in_progress');

    const completedRes = await updateTask(taskId, { status: 'completed' });
    expect(completedRes.data?.status).toBe('completed');
  });

  it('filters tasks by status', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    await createTask({ title: 'Task A', priority: 'low', status: 'pending' });
    await createTask({ title: 'Task B', priority: 'medium', status: 'completed' });

    const pendingOnly = await fetchTasks('pending');
    expect(pendingOnly.data.every((t) => t.status === 'pending')).toBe(true);
    expect(pendingOnly.data.length).toBe(1);

    const completedOnly = await fetchTasks('completed');
    expect(completedOnly.data.every((t) => t.status === 'completed')).toBe(true);
    expect(completedOnly.data.length).toBe(1);
  });

  it('deletes tasks cleanly', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const created = await createTask({ title: 'Temporary task', priority: 'low' });
    const delRes = await deleteTask(created.data!.id);
    expect(delRes.success).toBe(true);

    const listRes = await fetchTasks();
    expect(listRes.data.length).toBe(0);
  });
});

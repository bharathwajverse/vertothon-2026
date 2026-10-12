import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Plus, User, Clock } from 'lucide-react';
import { Card, Button, Badge } from '../../components/common';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../services/taskService';
import { useAuth } from '../../context';
import { Task, TaskPriority, TaskStatus } from '../../types';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchTasks(statusFilter);
    if (res.data) {
      setTasks(res.data);
    }
    setIsLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const res = await createTask(
      {
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
        status: 'pending',
      },
      user?.id
    );

    setIsSubmitting(false);
    if (res.data) {
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      await loadTasks();
    }
  };

  const handleStatusChange = async (taskId: string, nextStatus: TaskStatus) => {
    await updateTask(taskId, { status: nextStatus }, user?.id);
    await loadTasks();
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId, user?.id);
      await loadTasks();
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <Badge variant="danger">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            Organizer Task Management Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and coordinate operational assignments, logistical milestones, and staff duties for VERTOTHON 2026.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          data-testid="create-task-btn"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold w-fit">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid={`filter-tab-${st}`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading organizer tasks...</div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No tasks found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No operational tasks match this filter. Create a new task to organize venue duties, judging schedules, or equipment.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col justify-between space-y-4 border-slate-200">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{task.title}</h3>
                  {getPriorityBadge(task.priority)}
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assignee: {task.assignee.fullName || task.assignee.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="text-xs px-2 py-1 rounded border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  data-testid={`task-status-select-${task.id}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Operational Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Set up VIP Jury audio/video hardware"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  data-testid="task-title-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational details, checklist items..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !title.trim()}
                  data-testid="submit-task-btn"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

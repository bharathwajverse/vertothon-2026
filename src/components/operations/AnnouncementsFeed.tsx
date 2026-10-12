import React, { useState } from 'react';
import { Card, Button, Badge } from '../common';
import { Announcement, AnnouncementCategory } from '../../types';

interface AnnouncementsFeedProps {
  announcements: Announcement[];
  canBroadcast: boolean;
  onBroadcast: (data: {
    title: string;
    content: string;
    category: AnnouncementCategory;
    isPinned: boolean;
  }) => Promise<void>;
}

export const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({
  announcements,
  canBroadcast,
  onBroadcast,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSending(true);
    await onBroadcast({ title: title.trim(), content: content.trim(), category, isPinned });
    setIsSending(false);
    setTitle('');
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Live Announcements & Broadcasts
          </h2>
          <p className="text-xs text-slate-500">Official organizers' updates for VERTOTHON 2026.</p>
        </div>

        {canBroadcast && !showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            + Broadcast Alert
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-indigo-200 dark:border-indigo-800">
          <form onSubmit={handleSend} className="space-y-3 text-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">New Organizer Broadcast</h3>
            <div>
              <label htmlFor="ann-title" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Announcement Title
              </label>
              <input
                id="ann-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mentor Hours Opening at 2:00 PM"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex gap-4 items-center">
              <div>
                <label htmlFor="ann-cat" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="ann-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                >
                  <option value="general">General</option>
                  <option value="schedule">Schedule</option>
                  <option value="sponsor">Sponsor API</option>
                  <option value="emergency">Emergency / Alert</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold mt-4 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Pin to top
              </label>
            </div>

            <div>
              <label htmlFor="ann-body" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Message Body
              </label>
              <textarea
                id="ann-body"
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter broadcast details..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSending}>
                {isSending ? 'Posting...' : 'Publish'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <Card className="text-center py-6 text-xs text-slate-400">
            No announcements broadcasted yet.
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card
              key={ann.id}
              className={`space-y-2 ${
                ann.isPinned
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {ann.isPinned && <span title="Pinned Announcement">📌</span>}
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ann.title}</h4>
                </div>
                <Badge variant={ann.category === 'emergency' ? 'danger' : 'indigo'} size="sm">
                  {ann.category}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {ann.content}
              </p>
              <p className="text-[10px] text-slate-400">
                {new Date(ann.createdAt).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/common';
import { fetchAnnouncements, createAnnouncement } from '../../services/operationsService';
import { AnnouncementsFeed } from '../../components/operations/AnnouncementsFeed';
import { useAuth } from '../../context';
import { Announcement, AnnouncementCategory } from '../../types';

export const AnnouncementsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isStaff = profile?.role === 'admin' || profile?.role === 'lead_organizer' || profile?.role === 'volunteer';

  const loadData = async () => {
    setIsLoading(true);
    const res = await fetchAnnouncements();
    if (res.data) setAnnouncements(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBroadcast = async (data: {
    title: string;
    content: string;
    category: AnnouncementCategory;
    isPinned: boolean;
  }) => {
    if (!user) return;
    await createAnnouncement({
      title: data.title,
      content: data.content,
      category: data.category,
      isPinned: data.isPinned,
      authorId: user.id,
    });
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Announcements & Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates, schedule milestones, and organizer broadcasts for VERTOTHON 2026.
          </p>
        </div>

        <Badge variant="indigo">
          {announcements.length} {announcements.length === 1 ? 'Notice' : 'Notices'}
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading announcements...</div>
      ) : (
        <AnnouncementsFeed
          announcements={announcements}
          canBroadcast={isStaff}
          onBroadcast={handleBroadcast}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context';
import { CheckinDesk } from '../../components/operations/CheckinDesk';
import { AnnouncementsFeed } from '../../components/operations/AnnouncementsFeed';
import { IncidentConsole } from '../../components/operations/IncidentConsole';
import {
  fetchAnnouncements,
  createAnnouncement,
  fetchIncidents,
  reportIncident,
  updateIncidentStatus,
} from '../../services/operationsService';
import { Announcement, AnnouncementCategory, Incident, IncidentSeverity, IncidentStatus } from '../../types';

export const OperationsControlPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'checkin' | 'announcements' | 'incidents'>('checkin');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isStaff = profile?.role === 'admin' || profile?.role === 'lead_organizer' || profile?.role === 'volunteer';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [annRes, incRes] = await Promise.all([
        fetchAnnouncements(),
        fetchIncidents(),
      ]);

      if (annRes.data) setAnnouncements(annRes.data);
      if (incRes.data) setIncidents(incRes.data);
    } catch (err) {
      console.error('Failed to load operations data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleReportIncident = async (data: {
    title: string;
    description: string;
    severity: IncidentSeverity;
  }) => {
    if (!user) return;
    await reportIncident({
      title: data.title,
      description: data.description,
      severity: data.severity,
      reportedBy: user.id,
    });
    await loadData();
  };

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    await updateIncidentStatus(incidentId, newStatus);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Event Operations Command Center
          </h1>
          <p className="text-sm text-slate-500">
            Live check-in desk, organizer broadcasts, and operational incident log for VERTOTHON 2026.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'checkin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Check-in Desk
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'announcements'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'incidents'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Incidents ({incidents.filter((i) => i.status !== 'resolved').length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading operations center...</div>
      ) : activeTab === 'checkin' ? (
        <CheckinDesk />
      ) : activeTab === 'announcements' ? (
        <AnnouncementsFeed
          announcements={announcements}
          canBroadcast={isStaff}
          onBroadcast={handleBroadcast}
        />
      ) : (
        <IncidentConsole
          incidents={incidents}
          onReportIncident={handleReportIncident}
          onUpdateStatus={handleUpdateIncidentStatus}
        />
      )}
    </div>
  );
};

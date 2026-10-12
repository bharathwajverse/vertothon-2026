import React, { useState, useEffect } from 'react';
import { INITIAL_METRICS, INITIAL_ALERTS, DEMO_DATA_TAG } from '../../data/demoData';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { DatabaseStatusCard } from '../../components/dashboard/DatabaseStatusCard';
import {
  fetchLiveDashboardMetrics,
  generateParticipantsExportCsv,
} from '../../services/dashboardService';
import { MetricCardData } from '../../types';
import {
  Button,
  Badge,
  Modal,
  Toast,
  ToastItem,
  SelectDropdown,
  DataTable,
  ColumnDef,
} from '../../components/common';
import { Info, Bell, Calendar, ArrowRight, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentApplicant {
  id: string;
  name: string;
  track: string;
  team: string;
  status: 'approved' | 'pending' | 'waitlisted';
}

const DEMO_APPLICANTS: RecentApplicant[] = [
  { id: 'app-1', name: 'Varun Sharma', track: 'AI & ML', team: 'DeepPulse', status: 'approved' },
  { id: 'app-2', name: 'Ananya Reddy', track: 'Fintech', team: 'Solo (Matching)', status: 'pending' },
  { id: 'app-3', name: 'Karthik Rao', track: 'Open Innovation', team: 'NexusCore', status: 'approved' },
  { id: 'app-4', name: 'Divya Iyer', track: 'Fintech', team: 'LedgerFlow', status: 'waitlisted' },
];

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCardData[]>(INITIAL_METRICS);
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(false);
  const [trackFilter, setTrackFilter] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchLiveDashboardMetrics().then((res) => {
      if (isMounted) {
        setMetrics(res.metrics);
        setIsLiveTelemetry(res.isLive);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Event Tracks' },
    { value: 'ai', label: 'Artificial Intelligence' },
    { value: 'fintech', label: 'Fintech & Payments' },
    { value: 'open', label: 'Open Innovation' },
  ];

  const filteredApplicants = DEMO_APPLICANTS.filter((item) => {
    if (trackFilter === 'all') return true;
    if (trackFilter === 'ai') return item.track.includes('AI');
    if (trackFilter === 'fintech') return item.track.includes('Fintech');
    if (trackFilter === 'open') return item.track.includes('Open');
    return true;
  });

  const applicantColumns: ColumnDef<RecentApplicant>[] = [
    { key: 'name', header: 'Applicant Name', className: 'font-medium text-slate-900' },
    { key: 'track', header: 'Track' },
    { key: 'team', header: 'Team Affiliation' },
    {
      key: 'status',
      header: 'Review Status',
      render: (row) => {
        if (row.status === 'approved') {
          return <Badge variant="success" dot>Approved</Badge>;
        }
        if (row.status === 'waitlisted') {
          return <Badge variant="warning" dot>Waitlisted</Badge>;
        }
        return <Badge variant="info" dot>Pending Review</Badge>;
      },
    },
  ];

  const handleExportConfirm = async () => {
    setIsExportModalOpen(false);
    const csvContent = await generateParticipantsExportCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vertothon_participants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActiveToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      title: 'Audit Report Generated',
      message: 'Participant registration summary exported to CSV format.',
      duration: 3500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <Toast toast={activeToast} onDismiss={() => setActiveToast(null)} />
        </div>
      )}

      {/* Simulation / Live Telemetry Banner Notice (R5 Requirement) */}
      <div
        className={`border rounded-lg p-4 flex items-start gap-3 shadow-sm ${
          isLiveTelemetry
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        {isLiveTelemetry ? (
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        )}
        <div className="flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-2 font-semibold">
            <span>
              {isLiveTelemetry
                ? 'LIVE DATABASE TELEMETRY'
                : 'Demo Mode — Showing simulated data. Connect Supabase for live metrics.'}
            </span>
            <Badge variant={isLiveTelemetry ? 'success' : 'warning'}>
              {isLiveTelemetry ? 'Supabase Connected' : 'Simulated Data'}
            </Badge>
            <span className="text-xs font-mono font-normal text-amber-800">({DEMO_DATA_TAG})</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed opacity-90">
            {isLiveTelemetry
              ? 'Real-time telemetry aggregated directly from live Supabase PostgreSQL tables (profiles, teams, submissions).'
              : 'These metrics represent an isolated prototype simulation for the VERTOTHON 2026 operations dashboard. Real numbers will automatically display once Supabase is connected and populated.'}
          </p>
        </div>
      </div>

      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Event Control Room Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring registration intake, team formation, and onsite check-in readiness.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
          >
            Export Log
          </Button>
          <Link to="/app/checkin">
            <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Check-In Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} data={metric} />
        ))}
      </div>

      {/* Database Health Connectivity Status */}
      <DatabaseStatusCard />

      {/* Shared UI Demo: Filterable Applicants Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Live Intake Queue Preview
            </h3>
            <p className="text-xs text-slate-500">
              Interactive table rendered with the shared DataTable and SelectDropdown library components.
            </p>
          </div>

          <div className="w-full sm:w-60">
            <SelectDropdown
              label="Filter by Track"
              value={trackFilter}
              onChange={setTrackFilter}
              options={filterOptions}
            />
          </div>
        </div>

        <DataTable
          columns={applicantColumns}
          data={filteredApplicants}
          keyExtractor={(row) => row.id}
          emptyMessage="No applicants registered for this track yet."
        />
      </div>

      {/* Two-Column Operation Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Alerts Column */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900 text-sm">
                Active Operational Notices
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Simulation Stream
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {INITIAL_ALERTS.map((alert) => (
              <div key={alert.id} className="py-3.5 flex items-start gap-3">
                <span
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    alert.priority === 'high'
                      ? 'bg-rose-500'
                      : alert.priority === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                    <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Schedule Quick Glance */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-slate-600" />
              <h3 className="font-semibold text-slate-900 text-sm">
                Event Schedule Snapshot
              </h3>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-800">Registration Closes</p>
                <p className="text-slate-500 mt-0.5">October 31, 2026 • 23:59 IST</p>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-800">Day 1: Opening & Hacking</p>
                <p className="text-slate-500 mt-0.5">November 14, 2026 • 09:00 IST</p>
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-800">Day 2: Judging & Awards</p>
                <p className="text-slate-500 mt-0.5">November 15, 2026 • 15:00 IST</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Offline Operations</span>
            </span>
            <span className="font-medium text-slate-700">Hyderabad, India</span>
          </div>
        </div>
      </div>

      {/* Modal Dialog Integration */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        title="Export Operational Audit Log"
        description="Generate an archival snapshot for organizer records."
        confirmLabel="Export Records"
        cancelLabel="Dismiss"
      >
        <p className="text-sm text-slate-600">
          This operation compiles current attendee registrations and check-in statuses into a local CSV report.
        </p>
      </Modal>
    </div>
  );
};

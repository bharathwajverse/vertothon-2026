import React, { useState } from 'react';
import { Card, Button, Badge } from '../common';
import { Incident, IncidentSeverity, IncidentStatus } from '../../types';

interface IncidentConsoleProps {
  incidents: Incident[];
  onReportIncident: (data: { title: string; description: string; severity: IncidentSeverity }) => Promise<void>;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => Promise<void>;
}

export const IncidentConsole: React.FC<IncidentConsoleProps> = ({
  incidents,
  onReportIncident,
  onUpdateStatus,
}) => {
  const [showReport, setShowReport] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    await onReportIncident({ title: title.trim(), description: description.trim(), severity });
    setIsSubmitting(false);
    setTitle('');
    setDescription('');
    setShowReport(false);
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="danger" size="sm">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="warning" size="sm">HIGH</Badge>;
      case 'medium':
        return <Badge variant="info" size="sm">MEDIUM</Badge>;
      default:
        return <Badge variant="neutral" size="sm">LOW</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Operational Incidents Log
          </h2>
          <p className="text-xs text-slate-500">
            Real-time tracking of venue, wifi, electrical, and hardware issues during the hackathon.
          </p>
        </div>

        {!showReport && (
          <Button variant="danger" size="sm" onClick={() => setShowReport(true)}>
            + Log Incident
          </Button>
        )}
      </div>

      {showReport && (
        <Card className="border-rose-200 dark:border-rose-900/50">
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <h3 className="font-bold text-rose-800 dark:text-rose-300 text-sm">New Operations Incident</h3>
            <div>
              <label htmlFor="inc-title" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Incident Title
              </label>
              <input
                id="inc-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. WiFi Access Point 3 Down in Hall B"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label htmlFor="inc-sev" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                id="inc-sev"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Partial degradation</option>
                <option value="high">High - Area-wide blockage</option>
                <option value="critical">Critical - Event halting issue</option>
              </select>
            </div>

            <div>
              <label htmlFor="inc-desc" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Description & Location
              </label>
              <textarea
                id="inc-desc"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details for logistics team..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowReport(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Logging...' : 'Submit Incident'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.length === 0 ? (
          <Card className="text-center py-6 text-xs text-slate-400">
            No open incidents. All operational systems nominal.
          </Card>
        ) : (
          incidents.map((inc) => (
            <Card key={inc.id} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{inc.title}</h4>
                  {getSeverityBadge(inc.severity)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      inc.status === 'resolved'
                        ? 'success'
                        : inc.status === 'investigating'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {inc.status}
                  </Badge>

                  {inc.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs py-0.5 px-2"
                      onClick={() =>
                        onUpdateStatus(
                          inc.id,
                          inc.status === 'open' ? 'investigating' : 'resolved'
                        )
                      }
                    >
                      {inc.status === 'open' ? 'Investigate' : 'Resolve'}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{inc.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Logged {new Date(inc.createdAt).toLocaleTimeString()}</span>
                {inc.resolvedAt && (
                  <span className="text-emerald-600">
                    Resolved at {new Date(inc.resolvedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

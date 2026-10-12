import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, Badge, Button } from '../../components/common';
import { fetchAuditLogs } from '../../services/auditService';
import { AuditLog } from '../../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchAuditLogs(100);
    if (res.data) {
      setLogs(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Extract distinct actions
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort();

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }
    if (dateFilter) {
      const logDate = log.createdAt.slice(0, 10);
      if (logDate !== dateFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actor?.fullName?.toLowerCase().includes(q) || log.actor?.email?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchEntity = log.entityType.toLowerCase().includes(q) || (log.entityId && log.entityId.toLowerCase().includes(q));
      if (!matchActor && !matchAction && !matchEntity) return false;
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Administrative Audit Log Viewer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable timeline of privileged actions, status changes, badge check-ins, and scoring updates.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadLogs}>
          Refresh Audit Records
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter by Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              data-testid="filter-action-select"
            >
              <option value="all">All Actions ({logs.length})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter by Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                data-testid="filter-date-input"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Text Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search Actor / Entity
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actor name, entity ID..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Audit Records ({filteredLogs.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Telemetry</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading audit records...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No audit logs found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const actorDisplay = log.actor?.fullName || log.actor?.email || log.actorId || 'System';
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        data-testid={`audit-row-${log.id}`}
                      >
                        <td className="py-3 px-4 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="indigo">{log.action}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {actorDisplay}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                            {log.entityType}
                            {log.entityId && `: ${log.entityId.slice(0, 8)}...`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>

                      {/* Details Payload Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={6} className="p-4 pl-12">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700 text-xs">
                                  Complete Event Payload (JSON Viewer)
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ID: {log.id}
                                </span>
                              </div>
                              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto max-h-60">
                                {JSON.stringify(
                                  {
                                    id: log.id,
                                    action: log.action,
                                    actorId: log.actorId,
                                    actor: log.actor,
                                    entityType: log.entityType,
                                    entityId: log.entityId,
                                    timestamp: log.createdAt,
                                    details: log.details,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

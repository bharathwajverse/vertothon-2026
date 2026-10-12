import React, { useEffect, useState } from 'react';
import { checkDatabaseHealth, DatabaseHealthStatus } from '../../services/databaseHealth';
import { Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge, Button } from '../common';

export const DatabaseStatusCard: React.FC = () => {
  const [status, setStatus] = useState<DatabaseHealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const runCheck = async () => {
    setIsChecking(true);
    const result = await checkDatabaseHealth();
    setStatus(result);
    setIsChecking(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-600" />
          <h3 className="font-semibold text-slate-900 text-sm">
            Supabase Backend Health Check
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <Badge
              variant={
                status.isConnected
                  ? status.error
                    ? 'warning'
                    : 'success'
                  : 'danger'
              }
              dot
            >
              {status.isConnected
                ? status.error
                  ? 'Migrations Pending'
                  : 'Live Connected'
                : 'Disconnected'}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={runCheck}
            isLoading={isChecking}
            aria-label="Refresh database status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="text-xs space-y-2">
        {status ? (
          <>
            <div className="flex items-start gap-2">
              {status.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-medium text-slate-800">{status.message}</p>
                {status.latencyMs !== undefined && (
                  <p className="text-[11px] font-mono text-slate-500">
                    Endpoint Latency: {status.latencyMs}ms
                  </p>
                )}
                {status.error && (
                  <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                    {status.error}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-400 italic">Probing backend...</p>
        )}
      </div>
    </div>
  );
};

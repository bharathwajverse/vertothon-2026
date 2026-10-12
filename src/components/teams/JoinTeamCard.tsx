import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface JoinTeamCardProps {
  onJoin: (joinCode: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const JoinTeamCard: React.FC<JoinTeamCardProps> = ({
  onJoin,
  isSubmitting = false,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError('Please enter a valid 6-character team code.');
      return;
    }

    try {
      await onJoin(cleanCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team.');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Have a Join Code?</h3>
          <p className="text-xs text-slate-500">
            Ask your team leader for their 6-character team join code to join their roster immediately.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. 7K2M9X"
            className="w-full sm:w-48 px-3 py-2 text-center text-lg tracking-widest font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={isSubmitting || code.trim().length !== 6}
          >
            {isSubmitting ? 'Joining...' : 'Join Team'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

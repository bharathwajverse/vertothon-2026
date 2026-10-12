import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { HACKATHON_TRACKS, HackathonTrack } from '../../services/teamService';

interface CreateTeamFormProps {
  onSubmit: (data: { name: string; track: HackathonTrack; projectTitle?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [track, setTrack] = useState<HackathonTrack>('AI');
  const [projectTitle, setProjectTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    if (name.trim().length < 3) {
      setError('Team name must be at least 3 characters.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        track,
        projectTitle: projectTitle.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team.');
    }
  };

  return (
    <Card className="border-indigo-100 dark:border-indigo-900/40">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create a New Team</h3>
          <p className="text-xs text-slate-500">
            You will become the team leader and receive a unique 6-character code to invite up to 3 teammates.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="team-name-input" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Team Name *
          </label>
          <input
            id="team-name-input"
            type="text"
            required
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Neural Innovators"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="team-track-select" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Hackathon Track *
          </label>
          <select
            id="team-track-select"
            value={track}
            onChange={(e) => setTrack(e.target.value as HackathonTrack)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {HACKATHON_TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="team-project-input" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Initial Project Title or Theme (Optional)
          </label>
          <input
            id="team-project-input"
            type="text"
            maxLength={100}
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Autonomous Carbon Credit Verifier"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Team...' : 'Form Team'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

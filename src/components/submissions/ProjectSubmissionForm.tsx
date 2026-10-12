import React, { useState } from 'react';
import { Button, Card, Badge } from '../common';
import { Submission, HackathonTrack } from '../../types';
import { HACKATHON_TRACKS } from '../../services/teamService';
import { SUBMISSION_DEADLINE_ISO, isSubmissionDeadlinePassed } from '../../services/submissionService';

interface ProjectSubmissionFormProps {
  teamId: string;
  initialData?: Submission | null;
  defaultTrack?: HackathonTrack | string;
  isLeader: boolean;
  onSave: (data: {
    projectTitle: string;
    summary: string;
    repoUrl: string;
    demoUrl?: string;
    videoUrl?: string;
    track: HackathonTrack | string;
    techStack: string[];
  }, isFinalSubmit: boolean) => Promise<void>;
  isSaving?: boolean;
}

export const ProjectSubmissionForm: React.FC<ProjectSubmissionFormProps> = ({
  initialData,
  defaultTrack = 'AI',
  isLeader,
  onSave,
  isSaving = false,
}) => {
  const [projectTitle, setProjectTitle] = useState(initialData?.projectTitle || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl || '');
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [track, setTrack] = useState<HackathonTrack | string>(initialData?.track || defaultTrack);
  const [techStackInput, setTechStackInput] = useState(initialData?.techStack?.join(', ') || '');
  const [formError, setFormError] = useState<string | null>(null);

  const deadlinePassed = isSubmissionDeadlinePassed();
  const isSubmitted = initialData?.status === 'submitted';

  const handleAction = async (isFinalSubmit: boolean) => {
    setFormError(null);

    if (deadlinePassed) {
      setFormError('The submission deadline has passed. Modifications are locked.');
      return;
    }

    if (!projectTitle.trim()) {
      setFormError('Project title is required.');
      return;
    }

    if (summary.trim().length < 20) {
      setFormError('Please provide a project summary of at least 20 characters.');
      return;
    }

    if (!repoUrl.trim().startsWith('http')) {
      setFormError('A valid code repository URL (GitHub/GitLab) is required.');
      return;
    }

    if (demoUrl.trim() && !demoUrl.trim().startsWith('http')) {
      setFormError('Live demo URL must begin with http:// or https://');
      return;
    }

    if (videoUrl.trim() && !videoUrl.trim().startsWith('http')) {
      setFormError('Walkthrough video URL must begin with http:// or https://');
      return;
    }

    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await onSave(
        {
          projectTitle: projectTitle.trim(),
          summary: summary.trim(),
          repoUrl: repoUrl.trim(),
          demoUrl: demoUrl.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          track,
          techStack,
        },
        isFinalSubmit
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save project submission.');
    }
  };

  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Project Submission Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Submit your project repository, demo, and tech stack for VERTOTHON 2026 judging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <Badge variant="success" size="md">
              ✓ Submitted
            </Badge>
          ) : (
            <Badge variant="warning" size="md">
              Draft in Progress
            </Badge>
          )}
          <span className="text-xs text-slate-400">
            Deadline: {new Date(SUBMISSION_DEADLINE_ISO).toLocaleDateString()}
          </span>
        </div>
      </div>

      {formError && (
        <div role="alert" className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg">
          {formError}
        </div>
      )}

      {!isLeader && (
        <div className="p-3 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-lg">
          Notice: Only your team leader can submit or edit final project deliverables. You are viewing in read-only mode.
        </div>
      )}

      <div className="space-y-4 text-sm">
        <div>
          <label htmlFor="proj-title" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Project Title *
          </label>
          <input
            id="proj-title"
            type="text"
            disabled={!isLeader || deadlinePassed}
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Vertofi Decentralized Liquidity Engine"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="proj-track" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Judging Track *
            </label>
            <select
              id="proj-track"
              disabled={!isLeader || deadlinePassed}
              value={track}
              onChange={(e) => setTrack(e.target.value as HackathonTrack)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
            >
              {HACKATHON_TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proj-tech" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Tech Stack (Comma Separated)
            </label>
            <input
              id="proj-tech"
              type="text"
              disabled={!isLeader || deadlinePassed}
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. React, TypeScript, Rust, Supabase, Tailwind"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label htmlFor="proj-summary" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Executive Summary / Elevator Pitch *
          </label>
          <textarea
            id="proj-summary"
            rows={4}
            disabled={!isLeader || deadlinePassed}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Explain the problem your project solves, key innovations, and Vertofi alignment (min 20 characters)..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="proj-repo" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Repository URL *
            </label>
            <input
              id="proj-repo"
              type="url"
              disabled={!isLeader || deadlinePassed}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="proj-demo" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Live Demo URL
            </label>
            <input
              id="proj-demo"
              type="url"
              disabled={!isLeader || deadlinePassed}
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://my-app.vercel.app"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="proj-video" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Walkthrough Video URL
            </label>
            <input
              id="proj-video"
              type="url"
              disabled={!isLeader || deadlinePassed}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {isLeader && !deadlinePassed && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleAction(false)}
          >
            {isSaving ? 'Saving Draft...' : 'Save Draft'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={() => handleAction(true)}
          >
            {isSaving ? 'Submitting...' : 'Submit Final Deliverable'}
          </Button>
        </div>
      )}
    </Card>
  );
};

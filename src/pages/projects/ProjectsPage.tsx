import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context';
import { Card, Badge, Button } from '../../components/common';
import { ProjectSubmissionForm } from '../../components/submissions/ProjectSubmissionForm';
import { fetchUserTeam } from '../../services/teamService';
import {
  fetchTeamSubmission,
  fetchAllSubmissions,
  saveTeamSubmission,
} from '../../services/submissionService';
import { TeamWithMembers, Submission, HackathonTrack } from '../../types';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTeam, setActiveTeam] = useState<TeamWithMembers | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'my_project' | 'gallery'>('my_project');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [teamRes, allSubsRes] = await Promise.all([
        fetchUserTeam(user.id),
        fetchAllSubmissions(),
      ]);

      if (teamRes.data) {
        setActiveTeam(teamRes.data);
        const subRes = await fetchTeamSubmission(teamRes.data.id);
        if (subRes.data) {
          setSubmission(subRes.data);
        }
      }

      if (allSubsRes.data) {
        setAllSubmissions(allSubsRes.data);
      }
    } catch (err) {
      console.error('Error loading projects data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSubmission = async (
    data: {
      projectTitle: string;
      summary: string;
      repoUrl: string;
      demoUrl?: string;
      videoUrl?: string;
      track: HackathonTrack | string;
      techStack: string[];
    },
    isFinalSubmit: boolean
  ) => {
    if (!activeTeam) return;

    setIsSaving(true);
    setMessage(null);

    const res = await saveTeamSubmission(
      {
        teamId: activeTeam.id,
        projectTitle: data.projectTitle,
        summary: data.summary,
        repoUrl: data.repoUrl,
        demoUrl: data.demoUrl,
        videoUrl: data.videoUrl,
        track: data.track,
        techStack: data.techStack,
      },
      isFinalSubmit
    );

    setIsSaving(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
      throw res.error;
    }

    if (res.data) {
      setSubmission(res.data);
      setMessage({
        type: 'success',
        text: isFinalSubmit
          ? '🎉 Project deliverable successfully submitted for evaluation!'
          : 'Project draft saved successfully.',
      });
      loadData();
    }
  };

  const isLeader = Boolean(activeTeam && user && activeTeam.leaderId === user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Project Submissions
          </h1>
          <p className="text-sm text-slate-500">
            Submit final repositories and demos for VERTOTHON 2026.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('my_project')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'my_project'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Team Submission
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'gallery'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Project Gallery ({allSubmissions.length})
          </button>
        </div>
      </div>

      {message && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-sm border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs uppercase font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading project deliverables...</div>
      ) : activeTab === 'my_project' ? (
        !activeTeam ? (
          <Card className="text-center py-10 space-y-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              No Active Team Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You must form or join an approved team before creating or viewing project deliverables.
            </p>
            <a href="/teams" className="inline-block">
              <Button variant="primary" size="sm">
                Go to Teams Formation
              </Button>
            </a>
          </Card>
        ) : (
          <ProjectSubmissionForm
            teamId={activeTeam.id}
            initialData={submission}
            defaultTrack={activeTeam.track}
            isLeader={isLeader}
            onSave={handleSaveSubmission}
            isSaving={isSaving}
          />
        )
      ) : (
        /* Gallery of all submissions */
        <div className="space-y-4">
          {allSubmissions.length === 0 ? (
            <Card className="text-center py-8 text-slate-400 text-sm">
              No project deliverables submitted yet.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSubmissions.map((sub) => (
                <Card key={sub.id} className="space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {sub.projectTitle}
                      </h3>
                      <Badge variant={sub.status === 'submitted' ? 'success' : 'neutral'} size="sm">
                        {sub.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Track: {sub.track} {sub.team && `• Team ${sub.team.name}`}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mt-1">
                      {sub.summary}
                    </p>

                    {sub.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sub.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Source Code ↗
                    </a>
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline font-semibold"
                      >
                        Live Demo ↗
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

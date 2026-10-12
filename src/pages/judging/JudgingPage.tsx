import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context';
import { Card, Button, Badge } from '../../components/common';
import { ProjectScoringModal } from '../../components/judging/ProjectScoringModal';
import { fetchAllSubmissions } from '../../services/submissionService';
import { getSubmissionAverageScore, getSavedEvaluations } from '../../services/judgingService';
import { Submission } from '../../types';

export const JudgingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllSubmissions();
      if (res.data) {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error('Failed to load submissions for judging:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = submissions.filter((s) =>
    selectedTrack === 'all' ? true : s.track === selectedTrack
  );

  const myEvaluations = getSavedEvaluations().filter((e) => e.judgeId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Judging & Evaluation Engine
          </h1>
          <p className="text-sm text-slate-500">
            Official rubric evaluation (100 pts) for VERTOTHON 2026 hackathon deliverables.
          </p>
        </div>

        {/* Track Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Filter Track:</span>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="all">All Tracks</option>
            <option value="AI">AI</option>
            <option value="Web3">Web3</option>
            <option value="FinTech">FinTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="Open Innovation">Open Innovation</option>
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs uppercase font-bold text-slate-400">Total Submissions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{submissions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase font-bold text-slate-400">Your Evaluated Projects</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{myEvaluations.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase font-bold text-slate-400">Pending Evaluation</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {Math.max(0, submissions.length - myEvaluations.length)}
          </p>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading submissions for evaluation...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-8 text-slate-400 text-sm">
          No project deliverables available in this category.
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => {
            const myEval = myEvaluations.find((e) => e.submissionId === sub.id);
            const { average, count } = getSubmissionAverageScore(sub.id);

            return (
              <Card key={sub.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {sub.projectTitle}
                    </h3>
                    <Badge variant="indigo" size="sm">
                      {sub.track}
                    </Badge>
                    {sub.team && (
                      <span className="text-xs text-slate-400">• Team {sub.team.name}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl">
                    {sub.summary}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Repo ↗
                    </a>
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Demo ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Average Score ({count})
                    </p>
                    <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                      {average > 0 ? `${average} / 100` : '—'}
                    </p>
                  </div>

                  <Button
                    variant={myEval ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    {myEval ? `Edit Score (${myEval.totalScore})` : 'Score Project'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedSubmission && (
        <ProjectScoringModal
          submission={selectedSubmission}
          judgeId={user?.id || 'demo-judge'}
          judgeName={profile?.fullName || 'Official Judge'}
          onClose={() => setSelectedSubmission(null)}
          onSaved={loadData}
        />
      )}
    </div>
  );
};

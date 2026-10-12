import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/common';
import { Trophy, Clock } from 'lucide-react';
import { getSavedEvaluations } from '../../services/judgingService';
import { fetchAllSubmissions } from '../../services/submissionService';
import { ProjectEvaluation } from '../../types';

export const ResultsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<ProjectEvaluation[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function loadData() {
      const evals = getSavedEvaluations();
      const subsRes = await fetchAllSubmissions();
      setEvaluations(evals);
      
      // Check if results are officially published or evaluated
      const anyEvaluated = (subsRes.data || []).some((s) => s.status === 'evaluated') || evals.length > 0;
      setIsPublished(anyEvaluated);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hackathon Results & Final Standings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official evaluation outcomes and track rankings for VERTOTHON 2026.
          </p>
        </div>

        <Badge variant={isPublished ? 'success' : 'warning'}>
          {isPublished ? 'Evaluations Recorded' : 'Pending Jury Publication'}
        </Badge>
      </div>

      {!isPublished ? (
        <Card className="p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Results Not Yet Published
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Project evaluations will be published following the conclusion of Day 2 jury pitches and rubric aggregation (scheduled for Sunday, November 15, 2026 at 05:30 PM IST).
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-500">
            Results unlock automatically when scoring rounds are completed by judges.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Evaluation Records</h3>
                <p className="text-xs text-slate-500">
                  Total evaluations recorded across submissions: {evaluations.length}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {evaluations.map((ev) => (
                <div key={ev.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Project Submission: {ev.submissionId}
                    </p>
                    <p className="text-xs text-slate-500">
                      Evaluated by: {ev.judgeName || ev.judgeId}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-brand-600">
                      {ev.totalScore} / 100
                    </span>
                    <p className="text-[11px] text-slate-400">Total Score</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Card, Button } from '../common';
import { Submission } from '../../types';
import {
  RUBRIC_CRITERIA,
  calculateTotalScore,
  saveProjectEvaluation,
  getSavedEvaluations,
} from '../../services/judgingService';

interface ProjectScoringModalProps {
  submission: Submission;
  judgeId: string;
  judgeName: string;
  onClose: () => void;
  onSaved: () => void;
}

type RubricKey = 'innovation' | 'technical' | 'impact' | 'design';

export const ProjectScoringModal: React.FC<ProjectScoringModalProps> = ({
  submission,
  judgeId,
  judgeName,
  onClose,
  onSaved,
}) => {
  const existingEval = getSavedEvaluations().find(
    (e) => e.submissionId === submission.id && e.judgeId === judgeId
  );

  const [scores, setScores] = useState<Record<RubricKey, number> & { feedback: string; [k: string]: number | string }>({
    innovation: Number(existingEval?.scores.innovation ?? 18),
    technical: Number(existingEval?.scores.technical ?? 18),
    impact: Number(existingEval?.scores.impact ?? 18),
    design: Number(existingEval?.scores.design ?? 18),
    feedback: String(existingEval?.feedback || existingEval?.scores.feedback || ''),
  });

  const total = calculateTotalScore(scores);

  const handleScoreChange = (criteria: string, val: number) => {
    const clamped = Math.max(0, Math.min(25, val));
    setScores((prev) => ({ ...prev, [criteria]: clamped }));
  };

  const handleSave = () => {
    saveProjectEvaluation(submission.id, judgeId, judgeName, scores);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full space-y-4 my-8">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Score Submission: {submission.projectTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Track: {submission.track} {submission.team && `• Team ${submission.team.name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Project Links quick inspect */}
        <div className="flex gap-4 text-xs font-semibold">
          <a
            href={submission.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            Review Codebase ↗
          </a>
          {submission.demoUrl && (
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Test Live Demo ↗
            </a>
          )}
        </div>

        {/* Rubric sliders / inputs */}
        <div className="space-y-4 text-sm">
          {RUBRIC_CRITERIA.map((criterion) => (
            <div
              key={criterion.id}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    {criterion.label} (Max 25)
                  </h4>
                  <p className="text-[11px] text-slate-500">{criterion.description}</p>
                </div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {scores[criterion.id]} / 25
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={scores[criterion.id]}
                onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value, 10))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          ))}

          <div>
            <label htmlFor="eval-feedback" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Constructive Feedback / Judge Notes
            </label>
            <textarea
              id="eval-feedback"
              rows={3}
              value={scores.feedback}
              onChange={(e) => setScores((prev) => ({ ...prev, feedback: e.target.value }))}
              placeholder="Private comments on strengths, execution flaws, or Vertofi prize alignment..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Footer Score summary */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Total Rubric Score:</span>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {total} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Evaluation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

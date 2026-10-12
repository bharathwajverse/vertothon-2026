import { RubricCriteria, EvaluationScore, ProjectEvaluation } from '../types';

export const RUBRIC_CRITERIA: RubricCriteria[] = [
  {
    id: 'innovation',
    label: 'Innovation & Originality',
    maxScore: 25,
    weight: 0.25,
    description: 'Novelty of approach, creative problem solving, and uniqueness in the track.',
  },
  {
    id: 'technical',
    label: 'Technical Execution & Architecture',
    maxScore: 25,
    weight: 0.25,
    description: 'Code quality, technical complexity, stack appropriateness, and implementation integrity.',
  },
  {
    id: 'impact',
    label: 'Real-World Impact & Viability',
    maxScore: 25,
    weight: 0.25,
    description: 'Potential for market adoption, Vertofi ecosystem alignment, and scalability.',
  },
  {
    id: 'design',
    label: 'User Experience & Presentation',
    maxScore: 25,
    weight: 0.25,
    description: 'Intuitive interface, documentation clarity, live demo quality, and polish.',
  },
];

// Local storage key for offline-tolerant score tracking
const EVALUATIONS_STORAGE_KEY = 'vertothon_judging_evaluations_v1';

export function calculateTotalScore(scores: EvaluationScore): number {
  return scores.innovation + scores.technical + scores.impact + scores.design;
}

/**
 * Fetch all evaluations stored for projects.
 */
export function getSavedEvaluations(): ProjectEvaluation[] {
  try {
    const raw = localStorage.getItem(EVALUATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save or submit an evaluation for a project.
 */
export function saveProjectEvaluation(
  submissionId: string,
  judgeId: string,
  judgeName: string,
  scores: EvaluationScore
): ProjectEvaluation {
  const totalScore = calculateTotalScore(scores);
  const evaluation: ProjectEvaluation = {
    id: `${submissionId}-${judgeId}`,
    submissionId,
    judgeId,
    judgeName,
    scores,
    totalScore,
    submittedAt: new Date().toISOString(),
  };

  const existing = getSavedEvaluations().filter((e) => e.id !== evaluation.id);
  const updated = [...existing, evaluation];

  try {
    localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage fallback handled gracefully
  }

  return evaluation;
}

/**
 * Get average score for a submission across all judges.
 */
export function getSubmissionAverageScore(submissionId: string): { average: number; count: number } {
  const all = getSavedEvaluations().filter((e) => e.submissionId === submissionId);
  if (all.length === 0) return { average: 0, count: 0 };

  const sum = all.reduce((acc, curr) => acc + curr.totalScore, 0);
  return {
    average: Math.round((sum / all.length) * 10) / 10,
    count: all.length,
  };
}

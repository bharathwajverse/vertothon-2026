import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  RubricCriteria,
  EvaluationScore,
  ProjectEvaluation,
  JudgeAssignment,
  EvaluationStatus,
} from '../types';

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
  return (
    Number(scores.innovation || 0) +
    Number(scores.technical || 0) +
    Number(scores.impact || 0) +
    Number(scores.design || 0) +
    Number(scores.viability || 0) +
    Number(scores.presentation || 0)
  );
}

/**
 * Fetch all evaluations stored in local cache.
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
 * Update local storage cache of evaluations.
 */
function updateSavedEvaluationsCache(evaluations: ProjectEvaluation[]): void {
  try {
    localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(evaluations));
  } catch {
    // Ignore quota errors in constrained environments
  }
}

export function mapDatabaseRowToEvaluation(row: Record<string, unknown>): ProjectEvaluation {
  const scoresObj = (row.scores as EvaluationScore) || {
    innovation: 0,
    technical: 0,
  };

  return {
    id: String(row.id || `${row.submission_id}-${row.judge_id}`),
    submissionId: String(row.submission_id || ''),
    judgeId: String(row.judge_id || ''),
    scores: scoresObj,
    totalScore: Number(row.total_score || calculateTotalScore(scoresObj)),
    feedback: row.feedback ? String(row.feedback) : undefined,
    status: (row.status as EvaluationStatus) || 'submitted',
    submittedAt: row.submitted_at ? String(row.submitted_at) : String(row.created_at || new Date().toISOString()),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/**
 * Fetch evaluations from Supabase with offline cache fallback.
 */
export async function fetchEvaluations(
  submissionId?: string,
  judgeId?: string
): Promise<{ data: ProjectEvaluation[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    let cached = getSavedEvaluations();
    if (submissionId) cached = cached.filter((e) => e.submissionId === submissionId);
    if (judgeId) cached = cached.filter((e) => e.judgeId === judgeId);
    return { data: cached, error: null };
  }

  try {
    let query = supabase.from('evaluations').select('*');

    if (submissionId) query = query.eq('submission_id', submissionId);
    if (judgeId) query = query.eq('judge_id', judgeId);

    const { data, error } = await query;

    if (error) {
      console.warn('Failed to fetch evaluations from DB, falling back to local cache:', error.message);
      let cached = getSavedEvaluations();
      if (submissionId) cached = cached.filter((e) => e.submissionId === submissionId);
      if (judgeId) cached = cached.filter((e) => e.judgeId === judgeId);
      return { data: cached, error: new Error(error.message) };
    }

    const evaluations = (data || []).map(mapDatabaseRowToEvaluation);

    // Sync to local cache
    if (!submissionId && !judgeId) {
      updateSavedEvaluationsCache(evaluations);
    } else {
      const allCached = getSavedEvaluations();
      const nonMatching = allCached.filter((c) => !evaluations.some((e) => e.id === c.id));
      updateSavedEvaluationsCache([...nonMatching, ...evaluations]);
    }

    return { data: evaluations, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch evaluations');
    return { data: getSavedEvaluations(), error };
  }
}

/**
 * Save or submit an evaluation for a project.
 * Immediately saves to local storage (for fast UX and offline resilience)
 * and asynchronously persists to Supabase evaluations table.
 */
export function saveProjectEvaluation(
  submissionId: string,
  judgeId: string,
  judgeName: string,
  scores: EvaluationScore,
  status: EvaluationStatus = 'submitted'
): ProjectEvaluation {
  const totalScore = calculateTotalScore(scores);
  const submittedAt = new Date().toISOString();

  const evaluation: ProjectEvaluation = {
    id: `${submissionId}-${judgeId}`,
    submissionId,
    judgeId,
    judgeName,
    scores,
    totalScore,
    feedback: scores.feedback,
    status,
    submittedAt,
  };

  // 1. Immediately update local storage
  const existing = getSavedEvaluations().filter(
    (e) => !(e.submissionId === submissionId && e.judgeId === judgeId)
  );
  const updated = [...existing, evaluation];
  updateSavedEvaluationsCache(updated);

  // 2. Persist to Supabase if available
  if (isSupabaseConfigured) {
    void (async () => {
      try {
        const { error } = await supabase
          .from('evaluations')
          .upsert(
            {
              submission_id: submissionId,
              judge_id: judgeId,
              scores,
              total_score: totalScore,
              feedback: scores.feedback || null,
              status,
              submitted_at: submittedAt,
              updated_at: submittedAt,
            },
            { onConflict: 'judge_id,submission_id' }
          );
        if (error) {
          console.warn('Failed to persist evaluation to database:', error.message);
        }
      } catch (err: unknown) {
        console.warn('Network error saving evaluation to database:', err);
      }
    })();
  }

  return evaluation;
}

/**
 * Explicit async method to save and persist evaluation with result feedback.
 */
export async function persistEvaluation(
  submissionId: string,
  judgeId: string,
  judgeName: string,
  scores: EvaluationScore,
  status: EvaluationStatus = 'submitted'
): Promise<{ data: ProjectEvaluation; error: Error | null }> {
  const evaluation = saveProjectEvaluation(submissionId, judgeId, judgeName, scores, status);

  if (!isSupabaseConfigured) {
    return { data: evaluation, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('evaluations')
      .upsert(
        {
          submission_id: submissionId,
          judge_id: judgeId,
          scores,
          total_score: evaluation.totalScore,
          feedback: scores.feedback || null,
          status,
          submitted_at: evaluation.submittedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'judge_id,submission_id' }
      )
      .select()
      .single();

    if (error) {
      return { data: evaluation, error: new Error(error.message) };
    }

    const saved = mapDatabaseRowToEvaluation(data);
    return { data: { ...saved, judgeName }, error: null };
  } catch (err) {
    return {
      data: evaluation,
      error: err instanceof Error ? err : new Error('Failed to save evaluation to database'),
    };
  }
}

/**
 * Fetch judge assignments from Supabase.
 */
export async function fetchJudgeAssignments(
  judgeId?: string
): Promise<{ data: JudgeAssignment[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    let query = supabase.from('judge_assignments').select('*, submission:submissions(*)');

    if (judgeId) {
      query = query.eq('judge_id', judgeId);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    const assignments: JudgeAssignment[] = (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id || ''),
      judgeId: String(row.judge_id || ''),
      submissionId: String(row.submission_id || ''),
      assignedBy: row.assigned_by ? String(row.assigned_by) : undefined,
      createdAt: String(row.created_at || ''),
      submission: row.submission as JudgeAssignment['submission'],
    }));

    return { data: assignments, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch judge assignments');
    return { data: [], error };
  }
}

/**
 * Assign a judge to a submission (Organizer/Admin only).
 */
export async function assignJudgeToSubmission(
  judgeId: string,
  submissionId: string,
  assignedBy?: string
): Promise<{ data: JudgeAssignment | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database is offline.') };
  }

  try {
    const { data, error } = await supabase
      .from('judge_assignments')
      .upsert(
        {
          judge_id: judgeId,
          submission_id: submissionId,
          assigned_by: assignedBy,
        },
        { onConflict: 'judge_id,submission_id' }
      )
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: {
        id: String(data.id),
        judgeId: String(data.judge_id),
        submissionId: String(data.submission_id),
        assignedBy: data.assigned_by ? String(data.assigned_by) : undefined,
        createdAt: String(data.created_at),
      },
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to assign judge');
    return { data: null, error };
  }
}

/**
 * Get average score for a submission across all judges (synchronous / cached).
 */
export function getSubmissionAverageScore(
  submissionId: string,
  evaluationsList?: ProjectEvaluation[]
): { average: number; count: number } {
  const source = evaluationsList || getSavedEvaluations();
  const all = source.filter((e) => e.submissionId === submissionId);
  if (all.length === 0) return { average: 0, count: 0 };

  const sum = all.reduce((acc, curr) => acc + curr.totalScore, 0);
  return {
    average: Math.round((sum / all.length) * 10) / 10,
    count: all.length,
  };
}

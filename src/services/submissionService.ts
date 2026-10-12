import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Submission, SubmissionStatus, HackathonTrack } from '../types';

export interface SubmissionUpsertInput {
  teamId: string;
  projectTitle: string;
  summary: string;
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  track: HackathonTrack | string;
  techStack: string[];
  status?: SubmissionStatus;
}

export interface SubmissionQueryResult {
  data: Submission | null;
  error: Error | null;
}

export interface SubmissionListQueryResult {
  data: Submission[];
  count: number;
  error: Error | null;
}

// Global project submission deadline: Nov 15, 2026, 12:00 PM IST
export const SUBMISSION_DEADLINE_ISO = '2026-11-15T12:00:00+05:30';

export function isSubmissionDeadlinePassed(): boolean {
  return new Date().getTime() > new Date(SUBMISSION_DEADLINE_ISO).getTime();
}

export function mapDatabaseRowToSubmission(row: Record<string, unknown>): Submission {
  return {
    id: String(row.id || ''),
    teamId: String(row.team_id || ''),
    projectTitle: String(row.project_title || ''),
    summary: String(row.summary || ''),
    repoUrl: String(row.repo_url || ''),
    demoUrl: row.demo_url ? String(row.demo_url) : undefined,
    videoUrl: row.video_url ? String(row.video_url) : undefined,
    track: String(row.track || 'AI'),
    techStack: Array.isArray(row.tech_stack) ? (row.tech_stack as string[]) : [],
    status: (row.status as SubmissionStatus) || 'draft',
    submittedAt: row.submitted_at ? String(row.submitted_at) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    team: row.teams && typeof row.teams === 'object' ? {
      id: String((row.teams as Record<string, unknown>).id || ''),
      name: String((row.teams as Record<string, unknown>).name || ''),
      joinCode: String((row.teams as Record<string, unknown>).join_code || ''),
      leaderId: String((row.teams as Record<string, unknown>).leader_id || ''),
      track: String((row.teams as Record<string, unknown>).track || ''),
      maxCapacity: 4,
      createdAt: String((row.teams as Record<string, unknown>).created_at || ''),
    } : undefined,
  };
}

/**
 * Fetch project submission for a specific team.
 */
export async function fetchTeamSubmission(teamId: string): Promise<SubmissionQueryResult> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return {
      data: mapDatabaseRowToSubmission(data as Record<string, unknown>),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to load submission.'),
    };
  }
}

/**
 * Fetch all project submissions (for organizers, judges, or gallery).
 */
export async function fetchAllSubmissions(): Promise<SubmissionListQueryResult> {
  if (!isSupabaseConfigured) {
    return { data: [], count: 0, error: null };
  }

  try {
    const { data, count, error } = await supabase
      .from('submissions')
      .select('*, teams(id, name, join_code, leader_id, track)', { count: 'exact' })
      .order('submitted_at', { ascending: false, nullsFirst: false });

    if (error) {
      return { data: [], count: 0, error: new Error(error.message) };
    }

    const mapped = (data || []).map((row) =>
      mapDatabaseRowToSubmission(row as Record<string, unknown>)
    );

    return {
      data: mapped,
      count: count || mapped.length,
      error: null,
    };
  } catch (err) {
    return {
      data: [],
      count: 0,
      error: err instanceof Error ? err : new Error('Failed to load submissions list.'),
    };
  }
}

/**
 * Save or update a project submission (draft or final submitted state).
 */
export async function saveTeamSubmission(
  input: SubmissionUpsertInput,
  isFinalSubmit = false
): Promise<SubmissionQueryResult> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Database is offline. Live Supabase connection required.'),
    };
  }

  if (isSubmissionDeadlinePassed()) {
    return {
      data: null,
      error: new Error('Project submission deadline has passed. Modifications are locked.'),
    };
  }

  // Validate URLs and required fields
  const title = input.projectTitle.trim();
  const summary = input.summary.trim();
  const repo = input.repoUrl.trim();

  if (!title) {
    return { data: null, error: new Error('Project title is required.') };
  }
  if (!summary || summary.length < 20) {
    return { data: null, error: new Error('Project summary must be at least 20 characters.') };
  }
  if (!repo.startsWith('http://') && !repo.startsWith('https://')) {
    return { data: null, error: new Error('Repository URL must be a valid http or https URL.') };
  }

  if (input.demoUrl && !input.demoUrl.startsWith('http')) {
    return { data: null, error: new Error('Demo URL must be a valid URL.') };
  }
  if (input.videoUrl && !input.videoUrl.startsWith('http')) {
    return { data: null, error: new Error('Video URL must be a valid URL.') };
  }

  try {
    const status: SubmissionStatus = isFinalSubmit ? 'submitted' : (input.status || 'draft');
    const submittedAt = isFinalSubmit ? new Date().toISOString() : undefined;

    const payload: Record<string, unknown> = {
      team_id: input.teamId,
      project_title: title,
      summary,
      repo_url: repo,
      demo_url: input.demoUrl?.trim() || null,
      video_url: input.videoUrl?.trim() || null,
      track: input.track,
      tech_stack: input.techStack,
      status,
      updated_at: new Date().toISOString(),
    };

    if (submittedAt) {
      payload.submitted_at = submittedAt;
    }

    const { data, error } = await supabase
      .from('submissions')
      .upsert(payload, { onConflict: 'team_id' })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: mapDatabaseRowToSubmission(data as Record<string, unknown>),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to save submission.'),
    };
  }
}

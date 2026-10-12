import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MentorRequest, MentorRequestStatus } from '../types';
import { logAuditEvent } from './auditService';

const MENTOR_STORAGE_KEY = 'vertothon_mentor_requests_v1';

function getCachedMentorRequests(): MentorRequest[] {
  try {
    const raw = localStorage.getItem(MENTOR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateCachedMentorRequests(items: MentorRequest[]): void {
  try {
    localStorage.setItem(MENTOR_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export function mapDatabaseRowToMentorRequest(row: Record<string, unknown>): MentorRequest {
  return {
    id: String(row.id || ''),
    teamId: String(row.team_id || ''),
    requesterId: String(row.requester_id || ''),
    topic: String(row.topic || ''),
    description: String(row.description || ''),
    status: (row.status as MentorRequestStatus) || 'open',
    assignedMentorId: row.assigned_mentor_id ? String(row.assigned_mentor_id) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
    team: row.team as MentorRequest['team'],
    requester: row.requester as MentorRequest['requester'],
    assignedMentor: row.assigned_mentor as MentorRequest['assignedMentor'],
  };
}

/**
 * Fetch mentor requests for a specific team or across all teams for mentors/organizers.
 */
export async function fetchMentorRequests(
  teamId?: string,
  statusFilter?: MentorRequestStatus | 'all'
): Promise<{ data: MentorRequest[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    let cached = getCachedMentorRequests();
    if (teamId) cached = cached.filter((r) => r.teamId === teamId);
    if (statusFilter && statusFilter !== 'all') cached = cached.filter((r) => r.status === statusFilter);
    return { data: cached, error: null };
  }

  try {
    let query = supabase
      .from('mentor_requests')
      .select('*, team:teams(name, track), requester:profiles(full_name, email), assigned_mentor:profiles!assigned_mentor_id(full_name, email)')
      .order('created_at', { ascending: false });

    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback to cache on error
      let cached = getCachedMentorRequests();
      if (teamId) cached = cached.filter((r) => r.teamId === teamId);
      if (statusFilter && statusFilter !== 'all') cached = cached.filter((r) => r.status === statusFilter);
      return { data: cached, error: null };
    }

    const requests = (data || []).map(mapDatabaseRowToMentorRequest);

    // Sync to cache
    const existing = getCachedMentorRequests();
    const merged = [...requests, ...existing.filter((e) => !requests.some((r) => r.id === e.id))];
    updateCachedMentorRequests(merged);

    return { data: requests, error: null };
  } catch (err) {
    return {
      data: getCachedMentorRequests(),
      error: err instanceof Error ? err : new Error('Failed to fetch mentor requests'),
    };
  }
}

/**
 * Create a new mentor support ticket for a team.
 */
export async function createMentorRequest(
  teamId: string,
  requesterId: string,
  topic: string,
  description: string
): Promise<{ data: MentorRequest | null; error: Error | null }> {
  const localReq: MentorRequest = {
    id: `req-${Date.now()}`,
    teamId,
    requesterId,
    topic: topic.trim(),
    description: description.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const cached = getCachedMentorRequests();
    updateCachedMentorRequests([localReq, ...cached]);
    return { data: localReq, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('mentor_requests')
      .insert({
        team_id: teamId,
        requester_id: requesterId,
        topic: topic.trim(),
        description: description.trim(),
        status: 'open',
      })
      .select('*, team:teams(name, track), requester:profiles(full_name, email)')
      .single();

    if (error) {
      // Save locally as offline fallback
      const cached = getCachedMentorRequests();
      updateCachedMentorRequests([localReq, ...cached]);
      return { data: localReq, error: null };
    }

    const created = mapDatabaseRowToMentorRequest(data);
    const cached = getCachedMentorRequests();
    updateCachedMentorRequests([created, ...cached.filter((c) => c.id !== created.id)]);

    return { data: created, error: null };
  } catch (err) {
    const cached = getCachedMentorRequests();
    updateCachedMentorRequests([localReq, ...cached]);
    return {
      data: localReq,
      error: err instanceof Error ? err : new Error('Failed to create mentor request'),
    };
  }
}

/**
 * Claim or assign a mentor request.
 */
export async function claimMentorRequest(
  requestId: string,
  mentorId: string
): Promise<{ data: MentorRequest | null; error: Error | null }> {
  return updateMentorRequestStatus(requestId, 'in_progress', mentorId);
}

/**
 * Update the status of a mentor request ('open' | 'assigned' | 'in_progress' | 'resolved').
 */
export async function updateMentorRequestStatus(
  requestId: string,
  status: MentorRequestStatus,
  assignedMentorId?: string
): Promise<{ data: MentorRequest | null; error: Error | null }> {
  const isResolved = status === 'resolved';
  const resolvedAt = isResolved ? new Date().toISOString() : undefined;

  // Local cache update
  const cached = getCachedMentorRequests();
  const updatedList = cached.map((item) =>
    item.id === requestId
      ? {
          ...item,
          status,
          assignedMentorId: assignedMentorId ?? item.assignedMentorId,
          resolvedAt: isResolved ? resolvedAt : item.resolvedAt,
        }
      : item
  );
  updateCachedMentorRequests(updatedList);

  if (!isSupabaseConfigured) {
    const item = updatedList.find((i) => i.id === requestId) || null;
    return { data: item, error: null };
  }

  try {
    const payload: Record<string, unknown> = { status };
    if (assignedMentorId !== undefined) payload.assigned_mentor_id = assignedMentorId;
    if (isResolved) payload.resolved_at = resolvedAt;

    const { data, error } = await supabase
      .from('mentor_requests')
      .update(payload)
      .eq('id', requestId)
      .select('*, team:teams(name, track), requester:profiles(full_name, email), assigned_mentor:profiles!assigned_mentor_id(full_name, email)')
      .single();

    if (error) {
      return {
        data: updatedList.find((i) => i.id === requestId) || null,
        error: null,
      };
    }

    const updated = mapDatabaseRowToMentorRequest(data);
    void logAuditEvent(
      'mentor_request_status_updated',
      'mentor_request',
      requestId,
      { status, assignedMentorId },
      assignedMentorId
    );
    return { data: updated, error: null };
  } catch (err) {
    return {
      data: updatedList.find((i) => i.id === requestId) || null,
      error: err instanceof Error ? err : new Error('Failed to update request'),
    };
  }
}

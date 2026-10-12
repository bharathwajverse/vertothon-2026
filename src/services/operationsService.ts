import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Incident, IncidentSeverity, IncidentStatus, Announcement, AnnouncementCategory, UserProfile } from '../types';
import { mapDatabaseRowToProfile } from './profileService';
import { logAuditEvent } from './auditService';

export interface CheckinResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
  alreadyCheckedIn?: boolean;
}

/**
 * Scan & verify attendee QR token at the check-in desk.
 * Utilizes atomic checkin_participant PostgreSQL RPC function,
 * with graceful fallback to table queries for testing and offline environments.
 */
export async function verifyAndCheckInAttendee(
  tokenOrId: string,
  operatorId?: string
): Promise<CheckinResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Database is offline. Live connection required for check-in desk.' };
  }

  const clean = tokenOrId.trim();
  if (!clean) {
    return { success: false, error: 'Token or participant ID cannot be empty.' };
  }

  try {
    // 1. Try atomic PostgreSQL RPC function first
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('checkin_participant', {
        p_token: clean,
        p_operator_id: operatorId || (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
      });

      if (!rpcErr && rpcData && typeof rpcData === 'object') {
        const res = rpcData as Record<string, unknown>;
        const status = res.status as string;
        const message = (res.message as string) || '';
        const rawProfile = res.profile as Record<string, unknown> | undefined;
        const profile = rawProfile ? mapDatabaseRowToProfile(rawProfile) : undefined;

        if (status === 'success') {
          return {
            success: true,
            profile,
            alreadyCheckedIn: false,
          };
        }
        if (status === 'already_checked_in') {
          return {
            success: true,
            profile,
            alreadyCheckedIn: true,
            error: message,
          };
        }
        if (status === 'not_approved') {
          return {
            success: false,
            profile,
            error: message,
          };
        }
        if (status === 'not_found' || status === 'unauthorized') {
          return {
            success: false,
            error: message,
          };
        }
      }
    } catch {
      // Proceed to fallback logic
    }

    // 2. Resilient fallback query logic (when RPC function is not yet deployed or in unit test mocks)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

    let query = supabase.from('profiles').select('*');
    if (isUuid) {
      query = query.or(`id.eq.${clean},qr_checkin_token.eq.${clean}`);
    } else {
      query = query.eq('qr_checkin_token', clean);
    }

    const { data: profileRow, error: findErr } = await query.maybeSingle();

    if (findErr) {
      return { success: false, error: findErr.message };
    }

    if (!profileRow) {
      return { success: false, error: 'Participant badge not found. Check code or registration.' };
    }

    const profile = mapDatabaseRowToProfile(profileRow as Record<string, unknown>);

    if (profile.registrationStatus !== 'approved') {
      return {
        success: false,
        profile,
        error: `Cannot check in: Participant registration is currently "${profile.registrationStatus}". Must be "approved".`,
      };
    }

    if (profileRow.checked_in_at) {
      return {
        success: true,
        profile,
        alreadyCheckedIn: true,
        error: `Already checked in at ${new Date(String(profileRow.checked_in_at)).toLocaleTimeString()}.`,
      };
    }

    // 2. Mark checked in
    const checkinTime = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        checked_in_at: checkinTime,
        checked_in_by: operatorId || null,
      })
      .eq('id', profile.id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    void logAuditEvent(
      'participant_checkin',
      'profile',
      profile.id,
      {
        token: clean,
        participant_name: profile.fullName,
        participant_email: profile.email,
        checked_in_at: checkinTime,
        mode: 'fallback',
      },
      operatorId
    );

    return {
      success: true,
      profile: { ...profile, checkedInAt: checkinTime },
      alreadyCheckedIn: false,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Check-in failed.',
    };
  }
}

/**
 * Fetch Announcements feed
 */
export async function fetchAnnouncements(): Promise<{ data: Announcement[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: new Error(error.message) };

    const mapped: Announcement[] = (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id || ''),
      title: String(row.title || ''),
      content: String(row.content || ''),
      category: (row.category as AnnouncementCategory) || 'general',
      isPinned: Boolean(row.is_pinned),
      authorId: row.author_id ? String(row.author_id) : undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch announcements.') };
  }
}

/**
 * Create an Announcement (Organizers only)
 */
export async function createAnnouncement(input: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  isPinned: boolean;
  authorId: string;
}): Promise<{ data: Announcement | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database is offline.') };
  }

  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: input.title.trim(),
        content: input.content.trim(),
        category: input.category,
        is_pinned: input.isPinned,
        author_id: input.authorId,
      })
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };

    return {
      data: {
        id: String(data.id),
        title: String(data.title),
        content: String(data.content),
        category: data.category as AnnouncementCategory,
        isPinned: Boolean(data.is_pinned),
        authorId: data.author_id ? String(data.author_id) : undefined,
        createdAt: String(data.created_at),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Failed to broadcast announcement.') };
  }
}

/**
 * Fetch Operational Incidents (Staff only)
 */
export async function fetchIncidents(): Promise<{ data: Incident[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: new Error(error.message) };

    const mapped: Incident[] = (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id || ''),
      title: String(row.title || ''),
      description: String(row.description || ''),
      severity: (row.severity as IncidentSeverity) || 'medium',
      status: (row.status as IncidentStatus) || 'open',
      reportedBy: row.reported_by ? String(row.reported_by) : undefined,
      resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err : new Error('Failed to fetch incidents.') };
  }
}

/**
 * Report an incident (Staff only)
 */
export async function reportIncident(input: {
  title: string;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string;
}): Promise<{ data: Incident | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database is offline.') };
  }

  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        title: input.title.trim(),
        description: input.description.trim(),
        severity: input.severity,
        status: 'open',
        reported_by: input.reportedBy,
      })
      .select()
      .single();

    if (error) return { data: null, error: new Error(error.message) };

    return {
      data: {
        id: String(data.id),
        title: String(data.title),
        description: String(data.description),
        severity: data.severity as IncidentSeverity,
        status: data.status as IncidentStatus,
        reportedBy: data.reported_by ? String(data.reported_by) : undefined,
        createdAt: String(data.created_at),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Failed to report incident.') };
  }
}

/**
 * Update incident status (Staff only)
 */
export async function updateIncidentStatus(
  incidentId: string,
  newStatus: IncidentStatus
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Database is offline.') };
  }

  try {
    const payload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === 'resolved') {
      payload.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase.from('incidents').update(payload).eq('id', incidentId);
    if (error) return { success: false, error: new Error(error.message) };

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Failed to update incident.') };
  }
}

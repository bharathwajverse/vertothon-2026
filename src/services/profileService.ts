import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, RegistrationStatus } from '../types';

export interface ProfileUpdateInput {
  fullName?: string;
  collegeOrCompany?: string;
  githubHandle?: string;
  linkedinUrl?: string;
  tShirtSize?: string;
  dietaryRestrictions?: string;
}

export interface ProfileQueryResult {
  data: UserProfile | null;
  error: Error | null;
}

export interface ProfileListQueryResult {
  data: UserProfile[];
  count: number;
  error: Error | null;
}

export interface ReviewQueueFilters {
  status?: RegistrationStatus | 'all';
  searchQuery?: string;
}

// Convert database snake_case row to TypeScript camelCase UserProfile
export function mapDatabaseRowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id || ''),
    email: String(row.email || ''),
    fullName: String(row.full_name || ''),
    role: (row.role as UserProfile['role']) || 'participant',
    registrationStatus: (row.registration_status as UserProfile['registrationStatus']) || 'pending_review',
    githubHandle: row.github_handle ? String(row.github_handle) : undefined,
    linkedinUrl: row.linkedin_url ? String(row.linkedin_url) : undefined,
    collegeOrCompany: row.college_or_company ? String(row.college_or_company) : undefined,
    tShirtSize: row.t_shirt_size ? String(row.t_shirt_size) : undefined,
    dietaryRestrictions: row.dietary_restrictions ? String(row.dietary_restrictions) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    checkedInAt: row.checked_in_at ? String(row.checked_in_at) : undefined,
    checkedInBy: row.checked_in_by ? String(row.checked_in_by) : undefined,
    qrCheckinToken: row.qr_checkin_token ? String(row.qr_checkin_token) : undefined,
  };
}

/**
 * Fetch a single user's profile from Supabase by user ID.
 */
export async function fetchUserProfile(userId: string): Promise<ProfileQueryResult> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: mapDatabaseRowToProfile(data), error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Failed to fetch user profile');
    return { data: null, error };
  }
}

/**
 * Update the authenticated user's own profile.
 * Notice: This method strictly omits 'role' and 'registration_status' so participants
 * cannot perform client-side privilege escalation.
 */
export async function updateParticipantProfile(
  userId: string,
  input: ProfileUpdateInput
): Promise<ProfileQueryResult> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase is not configured. Profile changes cannot be saved to the database.'),
    };
  }

  try {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.fullName !== undefined) updatePayload.full_name = input.fullName.trim();
    if (input.collegeOrCompany !== undefined) updatePayload.college_or_company = input.collegeOrCompany.trim();
    if (input.githubHandle !== undefined) updatePayload.github_handle = input.githubHandle.trim();
    if (input.linkedinUrl !== undefined) updatePayload.linkedin_url = input.linkedinUrl.trim();
    if (input.tShirtSize !== undefined) updatePayload.t_shirt_size = input.tShirtSize;
    if (input.dietaryRestrictions !== undefined) updatePayload.dietary_restrictions = input.dietaryRestrictions.trim();

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapDatabaseRowToProfile(data), error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Failed to update participant profile');
    return { data: null, error };
  }
}

/**
 * Fetch applicants for the organizer review queue.
 * Accessible to authorized organizers and admins (enforced by RLS & helper checks).
 */
export async function fetchOrganizerApplicants(
  filters: ReviewQueueFilters = {}
): Promise<ProfileListQueryResult> {
  if (!isSupabaseConfigured) {
    return { data: [], count: 0, error: null };
  }

  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('registration_status', filters.status);
    }

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const sanitized = filters.searchQuery.trim();
      query = query.or(`full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,college_or_company.ilike.%${sanitized}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: [], count: 0, error: new Error(error.message) };
    }

    const profiles = (data || []).map(mapDatabaseRowToProfile);
    return { data: profiles, count: count ?? profiles.length, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Failed to fetch organizer review queue');
    return { data: [], count: 0, error };
  }
}

/**
 * Update an applicant's registration status.
 * Strictly permitted only for organizers/admins at the database RLS trigger level.
 */
export async function reviewApplicantStatus(
  applicantId: string,
  newStatus: RegistrationStatus
): Promise<ProfileQueryResult> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase is not configured. Review action cannot be completed.'),
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        registration_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicantId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapDatabaseRowToProfile(data), error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Failed to update registration status');
    return { data: null, error };
  }
}

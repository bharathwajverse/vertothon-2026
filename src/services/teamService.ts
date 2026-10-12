import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TeamWithMembers, TeamMember, HackathonTrack } from '../types';
import { mapDatabaseRowToProfile } from './profileService';

export type { HackathonTrack };

export interface CreateTeamInput {
  name: string;
  track: HackathonTrack | string;
  projectTitle?: string;
  leaderId: string;
}

export interface TeamQueryResult {
  data: TeamWithMembers | null;
  error: Error | null;
}

export interface TeamListQueryResult {
  data: TeamWithMembers[];
  count: number;
  error: Error | null;
}

export const HACKATHON_TRACKS: HackathonTrack[] = [
  'AI',
  'Web3',
  'FinTech',
  'HealthTech',
  'Open Innovation',
];

/**
 * Generate a 6-character uppercase alphanumeric join code (e.g. V26-K9 or 6 chars)
 */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded easily confused 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Map raw database team row and members to typed TeamWithMembers
 */
export function mapDatabaseRowToTeam(
  row: Record<string, unknown>,
  currentUserId?: string
): TeamWithMembers {
  const rawMembers = Array.isArray(row.team_members) ? row.team_members : [];

  const members: TeamMember[] = rawMembers.map((m: Record<string, unknown>) => {
    const rawProfile = m.profiles && typeof m.profiles === 'object' ? (m.profiles as Record<string, unknown>) : undefined;
    return {
      id: String(m.id || ''),
      teamId: String(m.team_id || row.id || ''),
      profileId: String(m.profile_id || ''),
      joinedAt: String(m.joined_at || new Date().toISOString()),
      profile: rawProfile ? mapDatabaseRowToProfile(rawProfile) : undefined,
    };
  });

  const leaderId = String(row.leader_id || '');

  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    joinCode: String(row.join_code || ''),
    leaderId,
    track: String(row.track || 'AI'),
    projectTitle: row.project_title ? String(row.project_title) : undefined,
    maxCapacity: typeof row.max_capacity === 'number' ? row.max_capacity : 4,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    members,
    isCurrentUserLeader: Boolean(currentUserId && currentUserId === leaderId),
  };
}

/**
 * Fetch the active team for a user (either as leader or member).
 */
export async function fetchUserTeam(userId: string): Promise<TeamQueryResult> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    // 1. Look up user in team_members
    const { data: memberRecord, error: memberErr } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (memberErr) {
      return { data: null, error: new Error(memberErr.message) };
    }

    if (!memberRecord) {
      return { data: null, error: null }; // Not in any team yet
    }

    // 2. Fetch full team data with all members & profiles
    const { data: teamData, error: teamErr } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          id,
          team_id,
          profile_id,
          joined_at,
          profiles (
            id,
            email,
            full_name,
            role,
            registration_status,
            github_handle,
            college_or_company
          )
        )
      `)
      .eq('id', memberRecord.team_id)
      .single();

    if (teamErr) {
      return { data: null, error: new Error(teamErr.message) };
    }

    return {
      data: mapDatabaseRowToTeam(teamData as Record<string, unknown>, userId),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to load user team.'),
    };
  }
}

/**
 * Fetch public / open teams with member counts for discovery.
 */
export async function fetchAllTeams(currentUserId?: string): Promise<TeamListQueryResult> {
  if (!isSupabaseConfigured) {
    return { data: [], count: 0, error: null };
  }

  try {
    const { data, count, error } = await supabase
      .from('teams')
      .select(
        `
        *,
        team_members (
          id,
          team_id,
          profile_id,
          joined_at,
          profiles (
            id,
            email,
            full_name,
            role,
            registration_status,
            github_handle,
            college_or_company
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], count: 0, error: new Error(error.message) };
    }

    const mapped = (data || []).map((row) =>
      mapDatabaseRowToTeam(row as Record<string, unknown>, currentUserId)
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
      error: err instanceof Error ? err : new Error('Failed to load teams list.'),
    };
  }
}

/**
 * Create a new team. Inserts team and automatically registers the leader in team_members.
 */
export async function createTeam(input: CreateTeamInput): Promise<TeamQueryResult> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Database is offline. Live Supabase connection required to form teams.'),
    };
  }

  try {
    const trimmedName = input.name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      return { data: null, error: new Error('Team name must be at least 3 characters.') };
    }

    const joinCode = generateJoinCode();

    // 1. Insert team
    const { data: createdTeam, error: createErr } = await supabase
      .from('teams')
      .insert({
        name: trimmedName,
        join_code: joinCode,
        leader_id: input.leaderId,
        track: input.track || 'AI',
        project_title: input.projectTitle?.trim() || null,
        max_capacity: 4,
      })
      .select()
      .single();

    if (createErr) {
      return { data: null, error: new Error(createErr.message) };
    }

    // 2. Insert leader into team_members junction
    const { error: memberErr } = await supabase.from('team_members').insert({
      team_id: createdTeam.id,
      profile_id: input.leaderId,
    });

    if (memberErr) {
      return { data: null, error: new Error(memberErr.message) };
    }

    // Re-fetch to return complete team object
    return await fetchUserTeam(input.leaderId);
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to create team.'),
    };
  }
}

/**
 * Join an existing team using a 6-character join code.
 */
export async function joinTeamByCode(
  joinCode: string,
  profileId: string
): Promise<{ success: boolean; team?: TeamWithMembers; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Database is offline. Live connection required.' };
  }

  const normalizedCode = joinCode.trim().toUpperCase();
  if (!normalizedCode || normalizedCode.length !== 6) {
    return { success: false, error: 'Join code must be exactly 6 characters.' };
  }

  try {
    // 1. Find team by join code
    const { data: team, error: lookupErr } = await supabase
      .from('teams')
      .select('id, name, max_capacity')
      .eq('join_code', normalizedCode)
      .maybeSingle();

    if (lookupErr) {
      return { success: false, error: lookupErr.message };
    }

    if (!team) {
      return { success: false, error: 'Invalid join code. No team found with this code.' };
    }

    // 2. Attempt to join team (Database triggers verify approval and capacity < 4)
    const { error: insertErr } = await supabase.from('team_members').insert({
      team_id: team.id,
      profile_id: profileId,
    });

    if (insertErr) {
      if (insertErr.message.includes('unique_profile_per_team') || insertErr.code === '23505') {
        return {
          success: false,
          error: 'You are already a member of a team. Leave your current team before joining another.',
        };
      }
      return { success: false, error: insertErr.message };
    }

    const { data: refreshedTeam } = await fetchUserTeam(profileId);
    return { success: true, team: refreshedTeam || undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to join team with given code.',
    };
  }
}

/**
 * Leave team (if member) or delete team (if leader).
 */
export async function leaveTeam(
  teamId: string,
  profileId: string,
  isLeader: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Database is offline.' };
  }

  try {
    if (isLeader) {
      // If the leader leaves, the team and memberships cascade delete
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      // Ordinary member leaves
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('profile_id', profileId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to leave team.',
    };
  }
}

/**
 * Team leader removes a member from the team.
 */
export async function removeTeamMember(
  teamId: string,
  memberProfileId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Database is offline.' };
  }

  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('profile_id', memberProfileId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove member.',
    };
  }
}

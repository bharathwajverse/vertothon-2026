import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateCsvString } from '../utils/csvExport';
import { fetchAllTeams } from './teamService';
import { fetchAllSubmissions } from './submissionService';
import { fetchEvaluations, calculateTotalScore } from './judgingService';

/**
 * 1. Export Participants
 * Headers: Name, Email, Role, Status, College, Team, Check-in status
 */
export async function exportParticipantsCsv(): Promise<string> {
  const headers = ['Name', 'Email', 'Role', 'Status', 'College', 'Team', 'Check-in status'];

  if (!isSupabaseConfigured) {
    const demoRows = [
      ['Varun Sharma', 'varun@example.com', 'participant', 'approved', 'IIT Bombay', 'Alpha Hackers', 'Checked In'],
      ['Ananya Reddy', 'ananya@example.com', 'participant', 'pending_review', 'BITS Pilani', 'None', 'Not Checked In'],
      ['Rohan Gupta', 'rohan@example.com', 'lead_organizer', 'approved', 'Vertofi', 'None', 'Checked In'],
    ];
    return generateCsvString(headers, demoRows);
  }

  try {
    const [profilesRes, teamsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      fetchAllTeams(),
    ]);

    const teamMap = new Map<string, string>();
    (teamsRes.data || []).forEach((t) => {
      t.members.forEach((m) => {
        teamMap.set(m.profileId, t.name);
      });
    });

    const rows = (profilesRes.data || []).map((p: Record<string, unknown>) => {
      const id = String(p.id || '');
      const name = String(p.full_name || '');
      const email = String(p.email || '');
      const role = String(p.role || 'participant');
      const status = String(p.registration_status || 'pending_review');
      const college = String(p.college_or_company || '');
      const team = teamMap.get(id) || 'None';
      const checkinStatus = p.checked_in_at ? `Checked In (${new Date(String(p.checked_in_at)).toISOString()})` : 'Not Checked In';

      return [name, email, role, status, college, team, checkinStatus];
    });

    return generateCsvString(headers, rows);
  } catch (err) {
    console.error('Failed to export participants:', err);
    return generateCsvString(headers, []);
  }
}

/**
 * 2. Export Teams
 * Headers: Team name, Join code, Leader, Members, Track, Submission status
 */
export async function exportTeamsCsv(): Promise<string> {
  const headers = ['Team name', 'Join code', 'Leader', 'Members', 'Track', 'Submission status'];

  if (!isSupabaseConfigured) {
    const demoRows = [
      ['Alpha Hackers', 'ALPHA9', 'Varun Sharma', 'Varun Sharma, Ananya Reddy', 'AI', 'Submitted'],
      ['Cipher Collective', 'CIPH26', 'Elena Rostova', 'Elena Rostova', 'Web3', 'Draft'],
    ];
    return generateCsvString(headers, demoRows);
  }

  try {
    const [teamsRes, subsRes] = await Promise.all([
      fetchAllTeams(),
      fetchAllSubmissions(),
    ]);

    const subMap = new Map<string, string>();
    (subsRes.data || []).forEach((s) => {
      subMap.set(s.teamId, s.status);
    });

    const rows = (teamsRes.data || []).map((t) => {
      const leaderMember = t.members.find((m) => m.profileId === t.leaderId);
      const leaderName = leaderMember?.profile?.fullName || t.leaderId;
      const memberNames = t.members.map((m) => m.profile?.fullName || m.profileId).join('; ');
      const submissionStatus = subMap.get(t.id) || 'Not Started';

      return [t.name, t.joinCode, leaderName, memberNames, t.track, submissionStatus];
    });

    return generateCsvString(headers, rows);
  } catch (err) {
    console.error('Failed to export teams:', err);
    return generateCsvString(headers, []);
  }
}

/**
 * 3. Export Attendance / Check-in Logs
 * Headers: Timestamp, Operator, Token, Name
 */
export async function exportAttendanceCsv(): Promise<string> {
  const headers = ['Timestamp', 'Operator', 'Token', 'Name'];

  if (!isSupabaseConfigured) {
    const demoRows = [
      ['2026-11-14T08:15:00Z', 'lead_organizer@vertofi.com', 'a1b2c3d4e5f67890', 'Varun Sharma'],
      ['2026-11-14T08:22:10Z', 'lead_organizer@vertofi.com', '12345678abcdef00', 'Rohan Gupta'],
    ];
    return generateCsvString(headers, demoRows);
  }

  try {
    // 1. Fetch checked-in profiles
    const { data: checkedInProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, qr_checkin_token, checked_in_at, checked_in_by')
      .not('checked_in_at', 'is', null)
      .order('checked_in_at', { ascending: false });

    // 2. Fetch audit logs for participant_checkin for operator context
    const { data: checkinAudits } = await supabase
      .from('audit_logs')
      .select('*, actor:profiles(full_name, email)')
      .eq('action', 'participant_checkin')
      .order('created_at', { ascending: false });

    const auditMap = new Map<string, string>();
    (checkinAudits || []).forEach((a: Record<string, unknown>) => {
      const entityId = String(a.entity_id || '');
      const actor = a.actor as { full_name?: string; email?: string } | undefined;
      const operator = actor?.full_name || actor?.email || String(a.actor_id || 'System');
      if (entityId) auditMap.set(entityId, operator);
    });

    const rows = (checkedInProfiles || []).map((p: Record<string, unknown>) => {
      const id = String(p.id || '');
      const time = String(p.checked_in_at || '');
      const operator = auditMap.get(id) || String(p.checked_in_by || 'Organizer Desk');
      const token = String(p.qr_checkin_token || id);
      const name = `${String(p.full_name || '')} (${String(p.email || '')})`;

      return [time, operator, token, name];
    });

    return generateCsvString(headers, rows);
  } catch (err) {
    console.error('Failed to export attendance:', err);
    return generateCsvString(headers, []);
  }
}

/**
 * 4. Export Submissions & Evaluation Scores
 * Headers: Project title, Track, Repo, Demo, Scores, Final Rank
 */
export async function exportSubmissionsScoresCsv(): Promise<string> {
  const headers = ['Project title', 'Track', 'Repo', 'Demo', 'Scores', 'Final Rank'];

  if (!isSupabaseConfigured) {
    const demoRows = [
      ['Decentralized Identity Vault', 'Web3', 'https://github.com/vertofi/vault', 'https://vault.demo.vertofi.com', '96 (Avg)', 'Rank #1'],
      ['Agentic Health Diagnosis', 'HealthTech', 'https://github.com/vertofi/health', 'https://health.demo.vertofi.com', '91 (Avg)', 'Rank #2'],
    ];
    return generateCsvString(headers, demoRows);
  }

  try {
    const [subsRes, evalsRes] = await Promise.all([
      fetchAllSubmissions(),
      fetchEvaluations(),
    ]);

    // Group evaluations by submission ID
    const scoreMap = new Map<string, number[]>();
    (evalsRes.data || []).forEach((ev) => {
      const list = scoreMap.get(ev.submissionId) || [];
      list.push(calculateTotalScore(ev.scores));
      scoreMap.set(ev.submissionId, list);
    });

    // Compute averages and sort for ranking
    const submissionScores = (subsRes.data || []).map((sub) => {
      const scores = scoreMap.get(sub.id) || [];
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        sub,
        avgScore: Math.round(avg * 10) / 10,
        evalCount: scores.length,
      };
    });

    // Rank scored projects
    submissionScores.sort((a, b) => b.avgScore - a.avgScore);

    const rows = submissionScores.map((item, index) => {
      const rank = item.avgScore > 0 ? `Rank #${index + 1}` : 'Unranked';
      const scoreStr = item.evalCount > 0 ? `${item.avgScore} (from ${item.evalCount} judges)` : 'Pending Scoring';
      return [
        item.sub.projectTitle,
        item.sub.track,
        item.sub.repoUrl,
        item.sub.demoUrl || '',
        scoreStr,
        rank,
      ];
    });

    return generateCsvString(headers, rows);
  } catch (err) {
    console.error('Failed to export submissions:', err);
    return generateCsvString(headers, []);
  }
}

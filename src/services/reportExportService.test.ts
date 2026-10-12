import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportParticipantsCsv,
  exportTeamsCsv,
  exportAttendanceCsv,
  exportSubmissionsScoresCsv,
} from '../services/reportExportService';
import * as supabaseModule from '../lib/supabase';

describe('Report Export Service Unit & Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports participants with required column headers in fallback/demo mode', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const csv = await exportParticipantsCsv();
    expect(csv).toContain('Name,Email,Role,Status,College,Team,Check-in status');
    expect(csv).toContain('Varun Sharma');
    expect(csv).toContain('IIT Bombay');
  });

  it('exports teams and rosters with correct format', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const csv = await exportTeamsCsv();
    expect(csv).toContain('Team name,Join code,Leader,Members,Track,Submission status');
    expect(csv).toContain('Alpha Hackers');
    expect(csv).toContain('ALPHA9');
  });

  it('exports attendance check-in logs with operator and token details', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const csv = await exportAttendanceCsv();
    expect(csv).toContain('Timestamp,Operator,Token,Name');
    expect(csv).toContain('Varun Sharma');
  });

  it('exports submissions and jury evaluations with scores and ranking', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(false);

    const csv = await exportSubmissionsScoresCsv();
    expect(csv).toContain('Project title,Track,Repo,Demo,Scores,Final Rank');
    expect(csv).toContain('Decentralized Identity Vault');
    expect(csv).toContain('Rank #1');
  });
});

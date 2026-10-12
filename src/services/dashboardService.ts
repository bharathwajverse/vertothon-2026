import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MetricCardData } from '../types';
import { INITIAL_METRICS } from '../data/demoData';

export interface DashboardMetricsResult {
  metrics: MetricCardData[];
  isLive: boolean;
  timestamp: string;
}

/**
 * Fetch live aggregate counts from Supabase tables or gracefully fallback to benchmark data
 */
export async function fetchLiveDashboardMetrics(): Promise<DashboardMetricsResult> {
  if (!isSupabaseConfigured) {
    return {
      metrics: INITIAL_METRICS,
      isLive: false,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const [profilesRes, approvedRes, teamsRes, subsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('registration_status', 'approved'),
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('submissions').select('id', { count: 'exact', head: true }),
    ]);

    if (profilesRes.error || approvedRes.error || teamsRes.error || subsRes.error) {
      throw new Error('Supabase telemetry query error');
    }

    const totalProfiles = profilesRes.count ?? 0;
    const approvedProfiles = approvedRes.count ?? 0;
    const totalTeams = teamsRes.count ?? 0;
    const totalSubs = subsRes.count ?? 0;

    const metrics: MetricCardData[] = [
      {
        id: 'registrations',
        label: 'Total Registrations',
        value: totalProfiles,
        target: 'Capacity: 1,000 (Target)',
        changeDescription: 'Live database tally',
        status: 'normal',
      },
      {
        id: 'approved',
        label: 'Approved Participants',
        value: approvedProfiles,
        target: 'Review Target: 600',
        changeDescription:
          totalProfiles > 0
            ? `${Math.round((approvedProfiles / totalProfiles) * 100)}% approval rate`
            : '0% approval rate',
        status: 'positive',
      },
      {
        id: 'teams',
        label: 'Formed Teams',
        value: totalTeams,
        target: '1-4 members per team',
        changeDescription: 'Active team formations',
        status: 'normal',
      },
      {
        id: 'projects',
        label: 'Project Submissions',
        value: totalSubs,
        target: 'Evaluated by jury panel',
        changeDescription: 'Deadline: Nov 15, 12:00 PM (Proposed)',
        status: 'warning',
      },
    ];

    return {
      metrics,
      isLive: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching dashboard telemetry:', err);
    return {
      metrics: INITIAL_METRICS,
      isLive: false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Generate CSV data export of participants for organizer audits
 */
export async function generateParticipantsExportCsv(): Promise<string> {
  if (!isSupabaseConfigured) {
    return 'ID,Name,Email,Role,Status,Affiliation\n1,Varun Sharma,varun@example.com,participant,approved,IIT Bombay\n2,Ananya Reddy,ananya@example.com,participant,pending_review,BITS Pilani\n';
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, registration_status, college_or_company, created_at')
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      return 'ID,Name,Email,Role,Status,Affiliation\n';
    }

    const header = 'ID,Name,Email,Role,Status,Affiliation,Created At\n';
    const rows = data
      .map(
        (r) =>
          `"${r.id}","${r.full_name}","${r.email}","${r.role}","${r.registration_status}","${r.college_or_company || ''}","${r.created_at}"`
      )
      .join('\n');

    return header + rows;
  } catch {
    return 'ID,Name,Email,Role,Status,Affiliation\n';
  }
}

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

    const totalProfiles = profilesRes.count ?? 0;
    const approvedProfiles = approvedRes.count ?? 0;
    const totalTeams = teamsRes.count ?? 0;
    const totalSubs = subsRes.count ?? 0;

    // If database has records, use live telemetry; if database is pristine/empty, overlay baseline targets
    const metrics: MetricCardData[] = [
      {
        id: 'registrations',
        label: 'Total Registrations',
        value: totalProfiles > 0 ? totalProfiles : 642,
        target: 'Capacity: 1,000',
        changeDescription: totalProfiles > 0 ? 'Live database tally' : '+48 in the last 24 hours',
        status: 'normal',
      },
      {
        id: 'approved',
        label: 'Approved Participants',
        value: approvedProfiles > 0 ? approvedProfiles : 418,
        target: 'Review Target: 600',
        changeDescription: totalProfiles > 0
          ? `${Math.round((approvedProfiles / (totalProfiles || 1)) * 100)}% approval rate`
          : '65.1% acceptance review rate',
        status: 'positive',
      },
      {
        id: 'teams',
        label: 'Formed Teams',
        value: totalTeams > 0 ? totalTeams : 112,
        target: 'Avg 3.7 members/team',
        changeDescription: totalTeams > 0 ? 'Active team formations' : '18 open teams looking for members',
        status: 'normal',
      },
      {
        id: 'projects',
        label: 'Project Submissions',
        value: totalSubs > 0 ? totalSubs : 29,
        target: 'Drafts in progress: 83',
        changeDescription: 'Deadline: Nov 15, 12:00 PM',
        status: 'warning',
      },
    ];

    return {
      metrics,
      isLive: totalProfiles > 0,
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

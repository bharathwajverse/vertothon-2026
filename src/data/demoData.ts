import { MetricCardData, OperationalAlert } from '../types';

/**
 * Explicit demo / prototype dataset for Phase 1.
 * Clearly labeled as simulation data to avoid confusion with live event telemetry.
 */
export const DEMO_DATA_TAG = 'PROTOTYPE SIMULATION DATA';

export const INITIAL_METRICS: MetricCardData[] = [
  {
    id: 'registrations',
    label: 'Total Registrations',
    value: 642,
    target: 'Capacity: 1,000',
    changeDescription: '+48 in the last 24 hours',
    status: 'normal',
  },
  {
    id: 'approved',
    label: 'Approved Participants',
    value: 418,
    target: 'Review Target: 600',
    changeDescription: '65.1% acceptance review rate',
    status: 'positive',
  },
  {
    id: 'teams',
    label: 'Formed Teams',
    value: 112,
    target: 'Avg 3.7 members/team',
    changeDescription: '18 open teams looking for members',
    status: 'normal',
  },
  {
    id: 'projects',
    label: 'Project Submissions',
    value: 29,
    target: 'Drafts in progress: 83',
    changeDescription: 'Deadline: Nov 15, 12:00 PM',
    status: 'warning',
  },
];

export const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'alert-1',
    title: 'Offline Venue Hall Allocation',
    message: 'Hyderabad venue seating layout draft is pending final sign-off from organizers.',
    timestamp: '10 mins ago',
    priority: 'medium',
  },
  {
    id: 'alert-2',
    title: 'Payment Processing Guardrail',
    message: 'Payment collection remains locked per Phase 0 organizer policy constraint.',
    timestamp: '1 hour ago',
    priority: 'low',
  },
  {
    id: 'alert-3',
    title: 'Mentor Shift Briefing',
    message: '24 volunteer mentors confirmed for AI & Fintech tracks.',
    timestamp: '3 hours ago',
    priority: 'low',
  },
];

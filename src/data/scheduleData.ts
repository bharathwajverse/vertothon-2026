export interface ScheduleItem {
  id: string;
  time: string;
  day: string;
  title: string;
  location: string;
  category: 'ceremony' | 'hacking' | 'food' | 'mentoring' | 'judging';
  description: string;
}

export const SCHEDULE_DAYS = [
  'Saturday, Nov 14, 2026 (Proposed)',
  'Sunday, Nov 15, 2026 (Proposed)',
] as const;

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  // Day 1
  {
    id: 's-1',
    day: 'Saturday, Nov 14, 2026 (Proposed)',
    time: '08:00 AM - 09:30 AM',
    title: 'Participant Check-in & Badge Issuance',
    location: 'Main Foyer Desk',
    category: 'ceremony',
    description: 'Onsite QR badge verification, kit distribution, and ID checks.',
  },
  {
    id: 's-2',
    day: 'Saturday, Nov 14, 2026 (Proposed)',
    time: '09:30 AM - 10:30 AM',
    title: 'Opening Ceremony & Keynote by Vertofi',
    location: 'Auditorium 1',
    category: 'ceremony',
    description: 'Hackathon kickoff, challenge briefing, and judging rubric overview.',
  },
  {
    id: 's-3',
    day: 'Saturday, Nov 14, 2026 (Proposed)',
    time: '11:00 AM',
    title: 'Hacking Officially Begins',
    location: 'Hacking Arena A & B',
    category: 'hacking',
    description: '36-hour build sprint begins across AI, Web3, FinTech, HealthTech, and Open Innovation.',
  },
  {
    id: 's-4',
    day: 'Saturday, Nov 14, 2026 (Proposed)',
    time: '01:00 PM - 02:00 PM',
    title: 'Networking Lunch',
    location: 'Dining Hall',
    category: 'food',
    description: 'Buffet lunch catering for all verified participants and mentors.',
  },
  {
    id: 's-5',
    day: 'Saturday, Nov 14, 2026 (Proposed)',
    time: '04:00 PM - 07:00 PM',
    title: 'Mentor Round 1: Architecture Reviews',
    location: 'Mentor Lounges',
    category: 'mentoring',
    description: 'Technical guidance from Vertofi engineers and industry mentors.',
  },
  {
    id: 's-6',
    day: 'Saturday, Nov 14, 2026 (Proposed)',
    time: '08:00 PM - 09:30 PM',
    title: 'Dinner & Mid-Hack Checkpoint',
    location: 'Dining Hall',
    category: 'food',
    description: 'Dinner break, lightning trivia, and energy drinks refresh.',
  },
  // Day 2
  {
    id: 's-7',
    day: 'Sunday, Nov 15, 2026 (Proposed)',
    time: '08:00 AM - 09:00 AM',
    title: 'Breakfast & Coffee Station',
    location: 'Dining Hall',
    category: 'food',
    description: 'Breakfast service and morning standup for teams.',
  },
  {
    id: 's-8',
    day: 'Sunday, Nov 15, 2026 (Proposed)',
    time: '12:00 PM Sharp',
    title: 'Code Freeze & Project Submissions Deadline',
    location: 'Submissions Portal',
    category: 'hacking',
    description: 'All repository URLs and demos must be submitted. Submissions lock automatically.',
  },
  {
    id: 's-9',
    day: 'Sunday, Nov 15, 2026 (Proposed)',
    time: '01:30 PM - 04:30 PM',
    title: 'Live Pitching & Judge Evaluations',
    location: 'Presentation Stages 1-3',
    category: 'judging',
    description: 'Finalist demonstrations and 4-criteria rubric evaluation by the jury panel.',
  },
  {
    id: 's-10',
    day: 'Sunday, Nov 15, 2026 (Proposed)',
    time: '05:30 PM - 06:30 PM',
    title: 'Awards Ceremony & Closing Remarks',
    location: 'Auditorium 1',
    category: 'ceremony',
    description: 'Top track recognition and Vertofi closing remarks.',
  },
];

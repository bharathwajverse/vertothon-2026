import React from 'react';
import { Card, Badge } from '../../components/common';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  day: string;
  title: string;
  location: string;
  category: 'ceremony' | 'hacking' | 'food' | 'mentoring' | 'judging';
  description: string;
}

const SCHEDULE_DATA: ScheduleItem[] = [
  // Day 1: Nov 14, 2026
  {
    id: 's-1',
    day: 'Saturday, Nov 14, 2026',
    time: '08:00 AM - 09:30 AM',
    title: 'Participant Check-in & Badge Issuance',
    location: 'Main Foyer Desk',
    category: 'ceremony',
    description: 'Onsite QR verification, swag kit distribution, and ID checks.',
  },
  {
    id: 's-2',
    day: 'Saturday, Nov 14, 2026',
    time: '09:30 AM - 10:30 AM',
    title: 'Opening Ceremony & Keynote by Vertofi',
    location: 'Auditorium 1',
    category: 'ceremony',
    description: 'Hackathon kickoff, challenge briefing, judging rubric overview.',
  },
  {
    id: 's-3',
    day: 'Saturday, Nov 14, 2026',
    time: '11:00 AM',
    title: 'Hacking Officially Begins',
    location: 'Hacking Arena A & B',
    category: 'hacking',
    description: '36-hour build sprint begins across AI, Web3, FinTech, and Open Innovation.',
  },
  {
    id: 's-4',
    day: 'Saturday, Nov 14, 2026',
    time: '01:00 PM - 02:00 PM',
    title: 'Networking Lunch',
    location: 'Dining Hall',
    category: 'food',
    description: 'Buffet lunch catering for all verified participants and mentors.',
  },
  {
    id: 's-5',
    day: 'Saturday, Nov 14, 2026',
    time: '04:00 PM - 07:00 PM',
    title: 'Mentor Round 1: Architecture Reviews',
    location: 'Mentor Lounges',
    category: 'mentoring',
    description: 'Technical guidance from Vertofi engineers and industry mentors.',
  },
  {
    id: 's-6',
    day: 'Saturday, Nov 14, 2026',
    time: '08:00 PM - 09:30 PM',
    title: 'Dinner & Mid-Hack Checkpoint',
    location: 'Dining Hall',
    category: 'food',
    description: 'Dinner break, lightning trivia, and energy drinks refresh.',
  },
  // Day 2: Nov 15, 2026
  {
    id: 's-7',
    day: 'Sunday, Nov 15, 2026',
    time: '08:00 AM - 09:00 AM',
    title: 'Breakfast & Coffee Station',
    location: 'Dining Hall',
    category: 'food',
    description: 'Breakfast service and morning standup for teams.',
  },
  {
    id: 's-8',
    day: 'Sunday, Nov 15, 2026',
    time: '12:00 PM Sharp',
    title: 'Code Freeze & Project Submissions Deadline',
    location: 'Submissions Portal',
    category: 'hacking',
    description: 'All repository URLs and demos must be submitted. Submissions lock automatically.',
  },
  {
    id: 's-9',
    day: 'Sunday, Nov 15, 2026',
    time: '01:30 PM - 04:30 PM',
    title: 'Live Pitching & Judge Evaluations',
    location: 'Presentation Stages 1-3',
    category: 'judging',
    description: 'Finalist demonstrations and 4-criteria rubric evaluation by the judging panel.',
  },
  {
    id: 's-10',
    day: 'Sunday, Nov 15, 2026',
    time: '05:30 PM - 06:30 PM',
    title: 'Awards Ceremony & Closing Remarks',
    location: 'Auditorium 1',
    category: 'ceremony',
    description: 'Prize distribution for top track winners and Vertofi closing remarks.',
  },
];

export const SchedulePage: React.FC = () => {
  const getCategoryBadge = (cat: ScheduleItem['category']) => {
    switch (cat) {
      case 'ceremony':
        return <Badge variant="indigo" size="sm">Ceremony</Badge>;
      case 'hacking':
        return <Badge variant="success" size="sm">Hacking</Badge>;
      case 'food':
        return <Badge variant="warning" size="sm">Food & Break</Badge>;
      case 'mentoring':
        return <Badge variant="info" size="sm">Mentoring</Badge>;
      case 'judging':
        return <Badge variant="danger" size="sm">Judging</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Official Event Timelines & Operations Schedule
          </h1>
          <p className="text-sm text-slate-500">
            Chronological milestones for VERTOTHON 2026 offline hackathon (November 14-15, 2026).
          </p>
        </div>

        <Badge variant="indigo" size="md">
          Offline Hackathon • 36 Hours
        </Badge>
      </div>

      {/* Schedule timeline */}
      <div className="space-y-6">
        {['Saturday, Nov 14, 2026', 'Sunday, Nov 15, 2026'].map((day) => {
          const items = SCHEDULE_DATA.filter((i) => i.day === day);

          return (
            <div key={day} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{day}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => (
                  <Card key={item.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.title}
                      </h3>
                      {getCategoryBadge(item.category)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.location}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

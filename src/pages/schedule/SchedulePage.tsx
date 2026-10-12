import React from 'react';
import { Card, Badge } from '../../components/common';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { SCHEDULE_ITEMS, SCHEDULE_DAYS, ScheduleItem } from '../../data/scheduleData';

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
        {SCHEDULE_DAYS.map((day) => {
          const items = SCHEDULE_ITEMS.filter((i) => i.day === day);

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

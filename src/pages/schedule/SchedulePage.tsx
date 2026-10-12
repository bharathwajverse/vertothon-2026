import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../../components/common';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { fetchScheduleItems, groupScheduleItemsByDay } from '../../services/scheduleService';
import { ScheduleItem } from '../../types';
import { SCHEDULE_ITEMS as FALLBACK_SCHEDULE_ITEMS } from '../../data/scheduleData';

export const SchedulePage: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>(FALLBACK_SCHEDULE_ITEMS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      setIsLoading(true);
      try {
        const res = await fetchScheduleItems(true);
        if (isMounted && res.data && res.data.length > 0) {
          setItems(res.data);
        }
      } catch (err) {
        console.error('Failed to load schedule from service:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, []);

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
      default:
        return <Badge variant="neutral" size="sm">{cat}</Badge>;
    }
  };

  const groupedDays = groupScheduleItemsByDay(items);
  const dayNames = Object.keys(groupedDays);

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

      {isLoading && items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Loading schedule...</div>
      ) : (
        <div className="space-y-6">
          {dayNames.map((day) => {
            const dayItems = groupedDays[day] || [];

            return (
              <div key={day} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{day}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dayItems.map((item) => (
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
                          {item.time || item.startTime}
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
      )}
    </div>
  );
};

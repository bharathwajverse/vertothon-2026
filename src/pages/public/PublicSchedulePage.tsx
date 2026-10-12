import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { EVENT_DETAILS } from '../../data/publicData';
import { fetchScheduleItems, groupScheduleItemsByDay } from '../../services/scheduleService';
import { ScheduleItem } from '../../types';
import { SCHEDULE_ITEMS as FALLBACK_SCHEDULE_ITEMS } from '../../data/scheduleData';

export const PublicSchedulePage: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>(FALLBACK_SCHEDULE_ITEMS);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      try {
        const res = await fetchScheduleItems(true);
        if (isMounted && res.data && res.data.length > 0) {
          setItems(res.data);
        }
      } catch (err) {
        console.error('Failed to load public schedule:', err);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryColor = (cat: ScheduleItem['category']) => {
    switch (cat) {
      case 'ceremony':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'hacking':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'food':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'mentoring':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      case 'judging':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const groupedDays = groupScheduleItemsByDay(items);
  const days = Object.keys(groupedDays);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Event Timeline
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          36-Hour Hackathon Schedule
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Chronological milestone timeline for VERTOTHON 2026. All times listed are in Indian Standard Time (IST).
        </p>

        {/* Notice Badge */}
        <div className="inline-flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            {EVENT_DETAILS.unconfirmedNotice} Detailed room allotments will be finalized closer to event kickoff.
          </span>
        </div>
      </div>

      {/* Timeline Days */}
      <div className="space-y-12">
        {days.map((day) => {
          const dayItems = groupedDays[day] || [];

          return (
            <div key={day} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">{day}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 space-y-3 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        {item.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border tracking-wider shrink-0 ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {item.time || item.startTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {item.location}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Card */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-8 text-center space-y-4">
        <h3 className="font-bold text-white text-lg">Want to be part of the action?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Sign up to secure your spot in the review queue and receive direct notifications about schedule checkpoints.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            <span>Register Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

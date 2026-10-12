import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context';
import { Card, Button, Badge } from '../../components/common';
import {
  fetchEventSettings,
  updateEventSettings,
  DEFAULT_EVENT_SETTINGS,
} from '../../services/eventSettingsService';
import { EventSettings } from '../../types';
import {
  Sliders,
  Calendar,
  MapPin,
  Users,
  Award,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const isOrganizer = role === 'admin' || role === 'lead_organizer';

  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetchEventSettings();
        if (isMounted && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load event settings:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = <K extends keyof EventSettings>(key: K, value: EventSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrganizer) return;

    setIsSaving(true);
    setFeedback(null);

    const res = await updateEventSettings(settings.id, settings, user?.id);
    setIsSaving(false);

    if (res.error) {
      setFeedback({ type: 'error', message: res.error.message });
    } else {
      if (res.data) setSettings(res.data);
      setFeedback({ type: 'success', message: 'Authoritative event settings updated successfully.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Operations Platform Settings
            </h1>
            <Badge variant="indigo" size="sm">
              Module: PLATFORM_SETTINGS
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure authoritative hackathon deadlines, capacity limits, platform feature flags, and official judging rubric.
          </p>
        </div>

        {!isOrganizer && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" />
            Read-Only (Organizer Access Required to Edit)
          </div>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading platform settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Event Identity */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Event Identity & Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={settings.eventName}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('eventName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organizer Organization
                </label>
                <input
                  type="text"
                  value={settings.organizerName}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('organizerName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Timezone
                </label>
                <input
                  type="text"
                  value={settings.timezone}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={settings.shortDescription}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Event Overview
                </label>
                <textarea
                  rows={2}
                  value={settings.longDescription}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('longDescription', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Deadlines & Timelines */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Authoritative Deadlines & Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="text"
                  value={settings.registrationDeadline}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">ISO format: YYYY-MM-DDTHH:MM:SS+05:30</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Submission Deadline (Canonical 12:00 PM IST)
                </label>
                <input
                  type="text"
                  value={settings.submissionDeadline}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('submissionDeadline', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-indigo-500 font-semibold mt-0.5">Locks portal at 12:00 PM IST on Day 2</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Kickoff (Start Time)
                </label>
                <input
                  type="text"
                  value={settings.startTime}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valedictory & Close (End Time)
                </label>
                <input
                  type="text"
                  value={settings.endTime}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </Card>

          {/* Section 3: Venue & Constraints */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Venue & Participation Limits
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Venue Location
                </label>
                <input
                  type="text"
                  value={settings.venue}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('venue', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  id="venue-confirmed"
                  type="checkbox"
                  checked={settings.isVenueConfirmed}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('isVenueConfirmed', e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600 border-slate-300"
                />
                <label htmlFor="venue-confirmed" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Venue is Formally Confirmed (Clear provisional notice)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Participant Capacity Limit
                </label>
                <input
                  type="number"
                  min={50}
                  max={5000}
                  value={settings.capacityLimit}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('capacityLimit', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={settings.maxTeamSize}
                    value={settings.minTeamSize}
                    disabled={!isOrganizer}
                    onChange={(e) => handleChange('minTeamSize', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={settings.minTeamSize}
                    max={10}
                    value={settings.maxTeamSize}
                    disabled={!isOrganizer}
                    onChange={(e) => handleChange('maxTeamSize', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: Operational Flags */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Operational Feature Flags
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentEnabled}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('paymentEnabled', e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600 border-slate-300"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Enable Registration Payment Gateway
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Free registration by default for VERTOTHON 2026. Only check if ticketing is required.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.resultsPublished}
                  disabled={!isOrganizer}
                  onChange={(e) => handleChange('resultsPublished', e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600 border-slate-300"
                />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Publish Official Final Results & Standings
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Reveals final scored rankings and track winners on the public /app/results view.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Section 5: Judging Rubric Review */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Official 5-Criteria Judging Rubric
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              {settings.judgingRubric.map((criterion, idx) => (
                <div
                  key={criterion.id || idx}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {criterion.label}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{criterion.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Weight: {Math.round(criterion.weight * 100)}%
                    </span>
                    <p className="text-[10px] text-slate-400">Max Score: {criterion.maxScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Save Bar */}
          {isOrganizer && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving Changes...' : 'Save Operations Settings'}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

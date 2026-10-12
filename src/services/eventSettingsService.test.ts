import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchEventSettings,
  updateEventSettings,
  mapDatabaseRowToEventSettings,
  DEFAULT_EVENT_SETTINGS,
} from './eventSettingsService';

describe('Event Settings Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mapDatabaseRowToEventSettings', () => {
    it('correctly maps raw PostgreSQL row to typed EventSettings', () => {
      const rawRow = {
        id: 'cfg-100',
        event_name: 'VERTOTHON 2026 TEST',
        short_description: 'Test short description',
        long_description: 'Test long description',
        organizer_name: 'Vertofi Labs',
        contact_email: 'ops@vertofi.com',
        timezone: 'Asia/Kolkata',
        start_time: '2026-11-14T08:00:00+05:30',
        end_time: '2026-11-15T20:00:00+05:30',
        registration_deadline: '2026-11-10T23:59:59+05:30',
        submission_deadline: '2026-11-15T12:00:00+05:30',
        venue: 'Hyderabad, India',
        is_venue_confirmed: true,
        capacity_limit: 1200,
        min_team_size: 2,
        max_team_size: 4,
        payment_enabled: false,
        results_published: false,
        judging_rubric: [
          { id: 'custom', label: 'Custom', maxScore: 10, weight: 1, description: 'Test' },
        ],
      };

      const mapped = mapDatabaseRowToEventSettings(rawRow);
      expect(mapped.id).toBe('cfg-100');
      expect(mapped.eventName).toBe('VERTOTHON 2026 TEST');
      expect(mapped.capacityLimit).toBe(1200);
      expect(mapped.isVenueConfirmed).toBe(true);
      expect(mapped.submissionDeadline).toBe('2026-11-15T12:00:00+05:30');
      expect(mapped.judgingRubric).toHaveLength(1);
    });

    it('falls back to default settings when row values are omitted', () => {
      const emptyRow = {};
      const mapped = mapDatabaseRowToEventSettings(emptyRow);
      expect(mapped.eventName).toBe(DEFAULT_EVENT_SETTINGS.eventName);
      expect(mapped.timezone).toBe('Asia/Kolkata');
      expect(mapped.submissionDeadline).toBe('2026-11-15T12:00:00+05:30');
    });
  });

  describe('fetchEventSettings fallback behavior', () => {
    it('returns DEFAULT_EVENT_SETTINGS when database is offline or not configured', async () => {
      const res = await fetchEventSettings();
      expect(res.error).toBeNull();
      expect(res.data.eventName).toBe('VERTOTHON 2026');
      expect(res.data.judgingRubric.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('updateEventSettings', () => {
    it('fails gracefully when Supabase is offline', async () => {
      const res = await updateEventSettings('cfg-100', { eventName: 'New Name' });
      expect(res.data).toBeNull();
      expect(res.error).toBeDefined();
    });
  });
});

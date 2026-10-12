import { describe, it, expect } from 'vitest';
import {
  fetchScheduleItems,
  formatTimeRange,
  formatDayHeader,
  groupScheduleItemsByDay,
  mapDatabaseRowToScheduleItem,
} from './scheduleService';

describe('Schedule Service Unit Tests', () => {
  describe('formatTimeRange', () => {
    it('formats time range between start and end timestamps', () => {
      const formatted = formatTimeRange('2026-11-14T08:00:00+05:30', '2026-11-14T09:30:00+05:30');
      expect(formatted).toContain('08:00 AM');
      expect(formatted).toContain('09:30 AM');
    });

    it('formats single start timestamp when end time is omitted', () => {
      const formatted = formatTimeRange('2026-11-14T11:00:00+05:30');
      expect(formatted).toContain('11:00 AM');
    });
  });

  describe('formatDayHeader', () => {
    it('converts timestamp to day header string', () => {
      const dayHeader = formatDayHeader('2026-11-14T08:00:00+05:30');
      expect(dayHeader).toContain('Saturday, Nov 14, 2026');
    });
  });

  describe('mapDatabaseRowToScheduleItem', () => {
    it('maps database schedule_items row to typed ScheduleItem', () => {
      const rawRow = {
        id: 'sch-1',
        title: 'Opening Ceremony',
        description: 'Kickoff keynote',
        start_time: '2026-11-14T09:30:00+05:30',
        end_time: '2026-11-14T10:30:00+05:30',
        location: 'Auditorium 1',
        category: 'ceremony',
        is_published: true,
        sort_order: 2,
      };

      const item = mapDatabaseRowToScheduleItem(rawRow);
      expect(item.id).toBe('sch-1');
      expect(item.title).toBe('Opening Ceremony');
      expect(item.isPublished).toBe(true);
      expect(item.sortOrder).toBe(2);
      expect(item.category).toBe('ceremony');
    });
  });

  describe('groupScheduleItemsByDay', () => {
    it('groups schedule items by their day property', () => {
      const items = [
        {
          id: '1',
          title: 'A',
          description: '',
          startTime: '2026-11-14T08:00:00+05:30',
          location: 'Main',
          category: 'ceremony' as const,
          isPublished: true,
          sortOrder: 1,
          day: 'Saturday, Nov 14, 2026 (Proposed)',
        },
        {
          id: '2',
          title: 'B',
          description: '',
          startTime: '2026-11-15T08:00:00+05:30',
          location: 'Dining',
          category: 'food' as const,
          isPublished: true,
          sortOrder: 2,
          day: 'Sunday, Nov 15, 2026 (Proposed)',
        },
      ];

      const grouped = groupScheduleItemsByDay(items);
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['Saturday, Nov 14, 2026 (Proposed)']).toHaveLength(1);
      expect(grouped['Sunday, Nov 15, 2026 (Proposed)']).toHaveLength(1);
    });
  });

  describe('fetchScheduleItems fallback', () => {
    it('returns default fallback schedule when database is offline', async () => {
      const res = await fetchScheduleItems();
      expect(res.error).toBeNull();
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].title).toBe('Participant Check-in & Badge Issuance');
    });
  });
});

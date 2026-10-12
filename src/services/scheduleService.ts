import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ScheduleItem, ScheduleCategory } from '../types';
import { SCHEDULE_ITEMS as FALLBACK_SCHEDULE_ITEMS } from '../data/scheduleData';

export function formatTimeRange(startTime: string, endTime?: string): string {
  try {
    const start = new Date(startTime);
    const startStr = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });

    if (!endTime) return startStr;

    const end = new Date(endTime);
    const endStr = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });

    return `${startStr} - ${endStr}`;
  } catch {
    return startTime;
  }
}

export function formatDayHeader(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }) + ' (Proposed)';
  } catch {
    return 'Event Schedule';
  }
}

export function mapDatabaseRowToScheduleItem(row: Record<string, unknown>): ScheduleItem {
  const startTime = String(row.start_time || '');
  const endTime = row.end_time ? String(row.end_time) : undefined;

  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    description: String(row.description || ''),
    startTime,
    endTime,
    location: String(row.location || ''),
    category: (row.category as ScheduleCategory) || 'general',
    isPublished: Boolean(row.is_published ?? true),
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
    day: formatDayHeader(startTime),
    time: formatTimeRange(startTime, endTime),
  };
}

/**
 * Fetch schedule items from the database with automatic fallback to static scheduleData.
 */
export async function fetchScheduleItems(
  publishedOnly = true
): Promise<{ data: ScheduleItem[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: FALLBACK_SCHEDULE_ITEMS, error: null };
  }

  try {
    let query = supabase
      .from('schedule_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('start_time', { ascending: true });

    if (publishedOnly) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Failed to load schedule from database, falling back to static schedule:', error.message);
      return { data: FALLBACK_SCHEDULE_ITEMS, error: null };
    }

    if (!data || data.length === 0) {
      return { data: FALLBACK_SCHEDULE_ITEMS, error: null };
    }

    return { data: data.map(mapDatabaseRowToScheduleItem), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch schedule items');
    return { data: FALLBACK_SCHEDULE_ITEMS, error };
  }
}

/**
 * Group schedule items by day for calendar display.
 */
export function groupScheduleItemsByDay(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  const groups: Record<string, ScheduleItem[]> = {};

  for (const item of items) {
    const dayKey = item.day || formatDayHeader(item.startTime);
    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(item);
  }

  return groups;
}

/**
 * Create a new schedule item (Organizers only).
 */
export async function createScheduleItem(
  item: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt' | 'day' | 'time'>
): Promise<{ data: ScheduleItem | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database is offline.') };
  }

  try {
    const { data, error } = await supabase
      .from('schedule_items')
      .insert({
        title: item.title,
        description: item.description,
        start_time: item.startTime,
        end_time: item.endTime,
        location: item.location,
        category: item.category,
        is_published: item.isPublished,
        sort_order: item.sortOrder,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapDatabaseRowToScheduleItem(data), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to create schedule item');
    return { data: null, error };
  }
}

/**
 * Update an existing schedule item (Organizers only).
 */
export async function updateScheduleItem(
  id: string,
  updates: Partial<ScheduleItem>
): Promise<{ data: ScheduleItem | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Database is offline.') };
  }

  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.startTime !== undefined) payload.start_time = updates.startTime;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.isPublished !== undefined) payload.is_published = updates.isPublished;
    if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

    const { data, error } = await supabase
      .from('schedule_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: mapDatabaseRowToScheduleItem(data), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to update schedule item');
    return { data: null, error };
  }
}

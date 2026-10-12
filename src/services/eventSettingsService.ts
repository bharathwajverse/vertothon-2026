import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EventSettings, RubricCriterion } from '../types';
import { logAuditEvent } from './auditService';

export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  eventName: 'VERTOTHON 2026',
  shortDescription: "India's Flagship 36-Hour Offline Hackathon by Vertofi",
  longDescription:
    'VERTOTHON 2026 convenes 1,000+ elite engineers, builders, and designers for a 36-hour offline hackathon sprint focused on AI, Web3, FinTech, and frontier tech.',
  organizerName: 'Vertofi',
  contactEmail: 'contact@vertofi.com',
  timezone: 'Asia/Kolkata',
  startTime: '2026-11-14T08:00:00+05:30',
  endTime: '2026-11-15T20:00:00+05:30',
  registrationDeadline: '2026-11-10T23:59:59+05:30',
  submissionDeadline: '2026-11-15T12:00:00+05:30',
  venue: 'Hyderabad, India',
  isVenueConfirmed: false,
  capacityLimit: 1000,
  minTeamSize: 1,
  maxTeamSize: 4,
  paymentEnabled: false,
  resultsPublished: false,
  judgingRubric: [
    {
      id: 'innovation',
      label: 'Innovation & Originality',
      maxScore: 10,
      weight: 0.25,
      description: 'Novelty of approach and creativity of solution.',
    },
    {
      id: 'technical',
      label: 'Technical Complexity',
      maxScore: 10,
      weight: 0.25,
      description: 'Code quality, architecture, technical challenge, and execution integrity.',
    },
    {
      id: 'design',
      label: 'UI/UX & Design',
      maxScore: 10,
      weight: 0.2,
      description: 'User experience, visual polish, and intuitive workflows.',
    },
    {
      id: 'viability',
      label: 'Viability & Impact',
      maxScore: 10,
      weight: 0.15,
      description: 'Real-world utility, market adoption potential, and scalability.',
    },
    {
      id: 'presentation',
      label: 'Presentation & Pitch',
      maxScore: 10,
      weight: 0.15,
      description: 'Clarity of demonstration, documentation, and communication.',
    },
  ],
  isActive: true,
};

export function mapDatabaseRowToEventSettings(row: Record<string, unknown>): EventSettings {
  return {
    id: String(row.id || DEFAULT_EVENT_SETTINGS.id),
    eventName: String(row.event_name || DEFAULT_EVENT_SETTINGS.eventName),
    shortDescription: String(row.short_description || DEFAULT_EVENT_SETTINGS.shortDescription),
    longDescription: String(row.long_description || DEFAULT_EVENT_SETTINGS.longDescription),
    organizerName: String(row.organizer_name || DEFAULT_EVENT_SETTINGS.organizerName),
    contactEmail: String(row.contact_email || DEFAULT_EVENT_SETTINGS.contactEmail),
    timezone: String(row.timezone || DEFAULT_EVENT_SETTINGS.timezone),
    startTime: String(row.start_time || DEFAULT_EVENT_SETTINGS.startTime),
    endTime: String(row.end_time || DEFAULT_EVENT_SETTINGS.endTime),
    registrationDeadline: String(row.registration_deadline || DEFAULT_EVENT_SETTINGS.registrationDeadline),
    submissionDeadline: String(row.submission_deadline || DEFAULT_EVENT_SETTINGS.submissionDeadline),
    venue: String(row.venue || DEFAULT_EVENT_SETTINGS.venue),
    isVenueConfirmed: Boolean(row.is_venue_confirmed ?? DEFAULT_EVENT_SETTINGS.isVenueConfirmed),
    capacityLimit: Number(row.capacity_limit || DEFAULT_EVENT_SETTINGS.capacityLimit),
    minTeamSize: Number(row.min_team_size || DEFAULT_EVENT_SETTINGS.minTeamSize),
    maxTeamSize: Number(row.max_team_size || DEFAULT_EVENT_SETTINGS.maxTeamSize),
    paymentEnabled: Boolean(row.payment_enabled ?? DEFAULT_EVENT_SETTINGS.paymentEnabled),
    resultsPublished: Boolean(row.results_published ?? DEFAULT_EVENT_SETTINGS.resultsPublished),
    judgingRubric: Array.isArray(row.judging_rubric)
      ? (row.judging_rubric as RubricCriterion[])
      : DEFAULT_EVENT_SETTINGS.judgingRubric,
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/**
 * Fetch authoritative Event Settings from Supabase with sensible fallback
 */
export async function fetchEventSettings(): Promise<{ data: EventSettings; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: DEFAULT_EVENT_SETTINGS, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('event_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Failed to fetch event settings from database, using fallback:', error.message);
      return { data: DEFAULT_EVENT_SETTINGS, error: null };
    }

    if (!data) {
      return { data: DEFAULT_EVENT_SETTINGS, error: null };
    }

    return { data: mapDatabaseRowToEventSettings(data), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to fetch event settings');
    return { data: DEFAULT_EVENT_SETTINGS, error };
  }
}

/**
 * Update authoritative Event Settings (restricted to organizers/admins)
 */
export async function updateEventSettings(
  id: string,
  updates: Partial<EventSettings>,
  actorId?: string
): Promise<{ data: EventSettings | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Database is offline. Settings update requires an active connection.'),
    };
  }

  try {
    const dbPayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.eventName !== undefined) dbPayload.event_name = updates.eventName;
    if (updates.shortDescription !== undefined) dbPayload.short_description = updates.shortDescription;
    if (updates.longDescription !== undefined) dbPayload.long_description = updates.longDescription;
    if (updates.organizerName !== undefined) dbPayload.organizer_name = updates.organizerName;
    if (updates.contactEmail !== undefined) dbPayload.contact_email = updates.contactEmail;
    if (updates.timezone !== undefined) dbPayload.timezone = updates.timezone;
    if (updates.startTime !== undefined) dbPayload.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbPayload.end_time = updates.endTime;
    if (updates.registrationDeadline !== undefined) dbPayload.registration_deadline = updates.registrationDeadline;
    if (updates.submissionDeadline !== undefined) dbPayload.submission_deadline = updates.submissionDeadline;
    if (updates.venue !== undefined) dbPayload.venue = updates.venue;
    if (updates.isVenueConfirmed !== undefined) dbPayload.is_venue_confirmed = updates.isVenueConfirmed;
    if (updates.capacityLimit !== undefined) dbPayload.capacity_limit = updates.capacityLimit;
    if (updates.minTeamSize !== undefined) dbPayload.min_team_size = updates.minTeamSize;
    if (updates.maxTeamSize !== undefined) dbPayload.max_team_size = updates.maxTeamSize;
    if (updates.paymentEnabled !== undefined) dbPayload.payment_enabled = updates.paymentEnabled;
    if (updates.resultsPublished !== undefined) dbPayload.results_published = updates.resultsPublished;
    if (updates.judgingRubric !== undefined) dbPayload.judging_rubric = updates.judgingRubric;

    const { data, error } = await supabase
      .from('event_settings')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    void logAuditEvent(
      'event_settings_updated',
      'event_settings',
      id,
      { ...updates },
      actorId
    );

    return { data: mapDatabaseRowToEventSettings(data), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to update event settings');
    return { data: null, error };
  }
}

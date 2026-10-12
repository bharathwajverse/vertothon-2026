import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types';

/**
 * Record an audit log entry for privileged actions (check-ins, status reviews, settings changes, evaluations).
 */
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId?: string,
  details: Record<string, unknown> = {},
  actorId?: string
): Promise<{ data: AuditLog | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const payload = {
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details,
      actor_id: actorId || null,
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Failed to record audit log:', error.message);
      return { data: null, error: null };
    }

    return {
      data: {
        id: String(data.id),
        action: String(data.action),
        entityType: String(data.entity_type),
        entityId: data.entity_id ? String(data.entity_id) : undefined,
        details: (data.details as Record<string, unknown>) || {},
        createdAt: String(data.created_at),
        actorId: data.actor_id ? String(data.actor_id) : undefined,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Audit logging error'),
    };
  }
}

/**
 * Fetch recent audit logs (restricted to organizers/admins).
 */
export async function fetchAuditLogs(
  limit = 50
): Promise<{ data: AuditLog[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, actor:profiles(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: [], error: null };
    }

    const logs: AuditLog[] = (data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id || ''),
      actorId: row.actor_id ? String(row.actor_id) : undefined,
      action: String(row.action || ''),
      entityType: String(row.entity_type || ''),
      entityId: row.entity_id ? String(row.entity_id) : undefined,
      details: (row.details as Record<string, unknown>) || {},
      createdAt: String(row.created_at || ''),
      actor: row.actor as AuditLog['actor'],
    }));

    return { data: logs, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err : new Error('Failed to fetch audit logs'),
    };
  }
}

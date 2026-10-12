import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DatabaseHealthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  latencyMs?: number;
  message: string;
  error?: string;
}

/**
 * Service to verify Supabase backend connectivity without exposing secrets or private records.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Supabase credentials are not configured in local environment.',
    };
  }

  const startTime = performance.now();
  try {
    // Perform a lightweight probe query against announcements (an open, read-only table)
    const { error } = await supabase
      .from('announcements')
      .select('id')
      .limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // If table does not exist yet (migrations pending in SQL editor), capture that cleanly
      if (error.code === '42P01') {
        return {
          isConfigured: true,
          isConnected: true,
          latencyMs,
          message: 'Connected to Supabase project! Initial SQL migrations have not been applied yet.',
          error: 'Tables pending: Please execute supabase/migrations/20261012000000_initial_schema.sql in the Supabase SQL Editor.',
        };
      }

      return {
        isConfigured: true,
        isConnected: false,
        latencyMs,
        message: 'Connected to project, but query failed.',
        error: error.message,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      latencyMs,
      message: 'Database connection live and operational.',
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      isConfigured: true,
      isConnected: false,
      latencyMs,
      message: 'Unable to reach Supabase endpoint.',
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

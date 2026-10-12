import { describe, it, expect, vi } from 'vitest';
import { checkDatabaseHealth } from './databaseHealth';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(),
  },
}));

describe('Database Health Service', () => {
  it('reports healthy status when announcements table is accessible', async () => {
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
      }),
    });

    const status = await checkDatabaseHealth();
    expect(status.isConfigured).toBe(true);
    expect(status.isConnected).toBe(true);
    expect(status.message).toContain('live and operational');
  });

  it('detects when tables are pending migration (error code 42P01)', async () => {
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '42P01', message: 'relation "announcements" does not exist' },
        }),
      }),
    });

    const status = await checkDatabaseHealth();
    expect(status.isConfigured).toBe(true);
    expect(status.isConnected).toBe(true);
    expect(status.message).toContain('migrations have not been applied yet');
    expect(status.error).toContain('Please execute');
  });
});

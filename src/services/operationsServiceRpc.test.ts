import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAndCheckInAttendee } from './operationsService';
import * as supabaseModule from '../lib/supabase';

describe('Operations Service Check-in Desk & RPC Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects empty badge tokens immediately without calling network', async () => {
    const res = await verifyAndCheckInAttendee('   ');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Token or participant ID cannot be empty.');
  });

  it('uses atomic checkin_participant RPC response when available', async () => {
    // Mock configured supabase
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true);

    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        status: 'success',
        message: 'Participant check-in successfully recorded.',
        profile: {
          id: 'user-777',
          full_name: 'Grace Hopper',
          email: 'grace@navy.mil',
          registration_status: 'approved',
          checked_in_at: '2026-11-14T08:15:00Z',
        },
      },
      error: null,
    });

    vi.spyOn(supabaseModule.supabase, 'rpc').mockImplementation(mockRpc as unknown as typeof supabaseModule.supabase.rpc);

    const res = await verifyAndCheckInAttendee('abcdef1234567890', 'operator-1');
    expect(mockRpc).toHaveBeenCalledWith('checkin_participant', {
      p_token: 'abcdef1234567890',
      p_operator_id: 'operator-1',
    });
    expect(res.success).toBe(true);
    expect(res.profile?.fullName).toBe('Grace Hopper');
    expect(res.alreadyCheckedIn).toBe(false);
  });

  it('handles already_checked_in RPC status gracefully', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true);

    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        status: 'already_checked_in',
        message: 'Already checked in at 08:30 AM.',
        profile: {
          id: 'user-777',
          full_name: 'Grace Hopper',
          email: 'grace@navy.mil',
          registration_status: 'approved',
        },
      },
      error: null,
    });

    vi.spyOn(supabaseModule.supabase, 'rpc').mockImplementation(mockRpc as unknown as typeof supabaseModule.supabase.rpc);

    const res = await verifyAndCheckInAttendee('abcdef1234567890', 'operator-1');
    expect(res.success).toBe(true);
    expect(res.alreadyCheckedIn).toBe(true);
    expect(res.error).toContain('Already checked in');
  });

  it('handles not_approved RPC status cleanly', async () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured', 'get').mockReturnValue(true);

    const mockRpc = vi.fn().mockResolvedValue({
      data: {
        status: 'not_approved',
        message: 'Cannot check in: Participant registration status is "pending_review". Must be "approved".',
      },
      error: null,
    });

    vi.spyOn(supabaseModule.supabase, 'rpc').mockImplementation(mockRpc as unknown as typeof supabaseModule.supabase.rpc);

    const res = await verifyAndCheckInAttendee('abcdef1234567890');
    expect(res.success).toBe(false);
    expect(res.error).toContain('pending_review');
  });
});

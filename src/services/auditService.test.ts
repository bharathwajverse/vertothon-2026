import { describe, it, expect } from 'vitest';
import { logAuditEvent, fetchAuditLogs } from './auditService';

describe('Audit Service Unit Tests', () => {
  it('handles offline database gracefully when logging audit events', async () => {
    const res = await logAuditEvent(
      'settings_updated',
      'event_settings',
      'cfg-1',
      { changed: 'venue' },
      'user-admin-1'
    );
    expect(res.error).toBeNull();
  });

  it('handles offline database gracefully when fetching audit logs', async () => {
    const res = await fetchAuditLogs();
    expect(res.error).toBeNull();
    expect(res.data).toEqual([]);
  });
});

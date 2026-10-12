import { describe, it, expect, beforeEach } from 'vitest';
import {
  fetchMentorRequests,
  createMentorRequest,
  claimMentorRequest,
  updateMentorRequestStatus,
  mapDatabaseRowToMentorRequest,
} from './mentorService';

describe('Mentor Service Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('mapDatabaseRowToMentorRequest', () => {
    it('maps database mentor_requests row correctly', () => {
      const row = {
        id: 'mr-1',
        team_id: 't-1',
        requester_id: 'p-1',
        topic: 'AI / ML & Model Inference',
        description: 'Need help with ONNX runtime export on edge devices.',
        status: 'open',
        created_at: '2026-10-12T12:00:00Z',
      };

      const mapped = mapDatabaseRowToMentorRequest(row);
      expect(mapped.id).toBe('mr-1');
      expect(mapped.teamId).toBe('t-1');
      expect(mapped.topic).toBe('AI / ML & Model Inference');
      expect(mapped.status).toBe('open');
    });
  });

  describe('Lifecycle in offline/local cache mode', () => {
    it('creates, claims, and resolves a mentor request', async () => {
      // 1. Create request
      const createRes = await createMentorRequest(
        'team-alpha',
        'user-1',
        'Smart Contracts',
        'Reentrancy guard issue on line 42.'
      );
      expect(createRes.error).toBeNull();
      expect(createRes.data).toBeDefined();
      expect(createRes.data?.topic).toBe('Smart Contracts');
      expect(createRes.data?.status).toBe('open');

      const requestId = createRes.data!.id;

      // 2. Fetch requests
      const listRes = await fetchMentorRequests('team-alpha');
      expect(listRes.data).toHaveLength(1);
      expect(listRes.data[0].id).toBe(requestId);

      // 3. Claim request
      const claimRes = await claimMentorRequest(requestId, 'mentor-42');
      expect(claimRes.data?.status).toBe('in_progress');
      expect(claimRes.data?.assignedMentorId).toBe('mentor-42');

      // 4. Resolve request
      const resolveRes = await updateMentorRequestStatus(requestId, 'resolved');
      expect(resolveRes.data?.status).toBe('resolved');
      expect(resolveRes.data?.resolvedAt).toBeDefined();
    });
  });
});

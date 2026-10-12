import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '@supabase/supabase-js';
import { MentorDeskPage } from './MentorDeskPage';
import { AuthContext } from '../../context/authContextInstance';
import * as mentorService from '../../services/mentorService';
import * as teamService from '../../services/teamService';
import { MentorRequest, UserRole } from '../../types';

describe('MentorDeskPage Component Tests', () => {
  const createAuthMock = (role: UserRole = 'participant') => ({
    user: { id: 'part-1', email: 'part@example.com' } as unknown as User,
    session: null,
    profile: {
      id: 'part-1',
      email: 'part@example.com',
      fullName: 'Participant Dev',
      role,
      registrationStatus: 'approved' as const,
      createdAt: '2026-10-12T00:00:00Z',
    },
    role,
    isLoading: false,
    isConfigured: true,
    error: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    clearError: vi.fn(),
    setDevelopmentRole: vi.fn(),
    refreshProfile: vi.fn(),
    updateProfileState: vi.fn(),
  });

  const mockRequests: MentorRequest[] = [
    {
      id: 'mr-1',
      teamId: 'team-alpha',
      requesterId: 'part-1',
      topic: 'AI / ML & Model Inference',
      description: 'Model inference latency is 2000ms. Help needed.',
      status: 'open',
      createdAt: '2026-10-12T10:00:00Z',
      team: {
        id: 'team-alpha',
        name: 'NeuralNet',
        joinCode: 'NN-26',
        leaderId: 'part-1',
        track: 'AI',
        maxCapacity: 4,
        createdAt: '2026-10-12T00:00:00Z',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(teamService, 'fetchUserTeam').mockResolvedValue({
      data: {
        ...mockRequests[0].team!,
        members: [],
      },
      error: null,
    });
    vi.spyOn(teamService, 'fetchCurrentUserTeam').mockResolvedValue({
      data: {
        ...mockRequests[0].team!,
        members: [],
      },
      error: null,
    });
  });

  it('renders open mentor requests and stats cards', async () => {
    vi.spyOn(mentorService, 'fetchMentorRequests').mockResolvedValue({
      data: mockRequests,
      error: null,
    });

    render(
      <AuthContext.Provider value={createAuthMock('participant')}>
        <MentorDeskPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mentor Help Desk')).toBeInTheDocument();
      expect(screen.getByText('AI / ML & Model Inference')).toBeInTheDocument();
      expect(screen.getByText(/Model inference latency is 2000ms/i)).toBeInTheDocument();
      expect(screen.getByText(/Open Tickets/i)).toBeInTheDocument();
    });
  });

  it('allows mentor to claim an open ticket', async () => {
    const user = userEvent.setup();
    vi.spyOn(mentorService, 'fetchMentorRequests').mockResolvedValue({
      data: mockRequests,
      error: null,
    });
    const claimSpy = vi.spyOn(mentorService, 'claimMentorRequest').mockResolvedValue({
      data: { ...mockRequests[0], status: 'in_progress', assignedMentorId: 'mentor-1' },
      error: null,
    });

    render(
      <AuthContext.Provider value={createAuthMock('mentor')}>
        <MentorDeskPage />
      </AuthContext.Provider>
    );

    const claimBtn = await screen.findByRole('button', { name: /Claim Ticket/i });
    await user.click(claimBtn);

    expect(claimSpy).toHaveBeenCalledWith('mr-1', 'part-1');
  });
});

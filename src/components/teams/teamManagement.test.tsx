import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamDashboard } from './TeamDashboard';
import { CreateTeamForm } from './CreateTeamForm';
import { JoinTeamCard } from './JoinTeamCard';
import { TeamDirectory } from './TeamDirectory';
import { generateJoinCode } from '../../services/teamService';
import { TeamWithMembers } from '../../types';

describe('Team Management Unit & Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateJoinCode helper', () => {
    it('generates a 6-character alphanumeric uppercase code without ambiguous letters', () => {
      const code = generateJoinCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      expect(code).not.toMatch(/[0O1I]/); // Confusing chars excluded
    });
  });

  describe('TeamDashboard Component', () => {
    const mockTeam: TeamWithMembers = {
      id: 'team-1',
      name: 'CyberDefenders',
      joinCode: 'CYBER7',
      leaderId: 'user-leader-1',
      track: 'AI',
      projectTitle: 'AI Fraud Detection',
      maxCapacity: 4,
      createdAt: '2026-10-12T10:00:00Z',
      members: [
        {
          id: 'mem-1',
          teamId: 'team-1',
          profileId: 'user-leader-1',
          joinedAt: '2026-10-12T10:00:00Z',
          profile: {
            id: 'user-leader-1',
            email: 'leader@example.com',
            fullName: 'Ada Lovelace',
            role: 'participant',
            registrationStatus: 'approved',
            collegeOrCompany: 'Oxford',
            createdAt: '2026-10-12T10:00:00Z',
          },
        },
        {
          id: 'mem-2',
          teamId: 'team-1',
          profileId: 'user-member-2',
          joinedAt: '2026-10-12T10:30:00Z',
          profile: {
            id: 'user-member-2',
            email: 'member@example.com',
            fullName: 'Alan Turing',
            role: 'participant',
            registrationStatus: 'approved',
            collegeOrCompany: 'Cambridge',
            createdAt: '2026-10-12T10:00:00Z',
          },
        },
      ],
    };

    it('renders team header, track, join code, and member roster', () => {
      render(
        <TeamDashboard
          team={mockTeam}
          currentUserId="user-leader-1"
          onLeaveTeam={vi.fn()}
          onRemoveMember={vi.fn()}
        />
      );

      expect(screen.getByText('CyberDefenders')).toBeInTheDocument();
      expect(screen.getByText(/AI Track/i)).toBeInTheDocument();
      expect(screen.getByText('AI Fraud Detection')).toBeInTheDocument();
      expect(screen.getByTestId('team-join-code-display')).toHaveTextContent('CYBER7');
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
      expect(screen.getByText('Team Leader')).toBeInTheDocument();
      expect(screen.getByText('2 of 4 spots filled')).toBeInTheDocument();
    });

    it('allows the team leader to remove a non-leader member', async () => {
      const user = userEvent.setup();
      const mockRemove = vi.fn().mockResolvedValue(undefined);

      render(
        <TeamDashboard
          team={mockTeam}
          currentUserId="user-leader-1"
          onLeaveTeam={vi.fn()}
          onRemoveMember={mockRemove}
        />
      );

      const removeButton = screen.getByRole('button', { name: /Remove/i });
      expect(removeButton).toBeInTheDocument();
      await user.click(removeButton);

      expect(mockRemove).toHaveBeenCalledWith('user-member-2');
    });

    it('shows Disband Team option for leader and Leave Team option for non-leader', async () => {
      const user = userEvent.setup();
      const mockLeave = vi.fn().mockResolvedValue(undefined);

      // Render as normal member
      const { rerender } = render(
        <TeamDashboard
          team={mockTeam}
          currentUserId="user-member-2"
          onLeaveTeam={mockLeave}
          onRemoveMember={vi.fn()}
        />
      );

      const leaveButton = screen.getByRole('button', { name: /Leave Team/i });
      expect(leaveButton).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Disband Team/i })).not.toBeInTheDocument();

      await user.click(leaveButton);
      expect(mockLeave).toHaveBeenCalledTimes(1);

      // Rerender as leader
      rerender(
        <TeamDashboard
          team={mockTeam}
          currentUserId="user-leader-1"
          onLeaveTeam={mockLeave}
          onRemoveMember={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /Disband Team/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Leave Team/i })).not.toBeInTheDocument();
    });
  });

  describe('CreateTeamForm Component', () => {
    it('validates team name and submits valid input', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn().mockResolvedValue(undefined);
      const mockCancel = vi.fn();

      render(
        <CreateTeamForm
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      );

      const nameInput = screen.getByLabelText(/Team Name/i);
      const trackSelect = screen.getByLabelText(/Hackathon Track/i);
      const projectInput = screen.getByLabelText(/Initial Project Title/i);
      const submitBtn = screen.getByRole('button', { name: /Form Team/i });

      // Enter short name (< 3 chars)
      await user.type(nameInput, 'AB');
      await user.click(submitBtn);
      expect(screen.getByText(/Team name must be at least 3 characters/i)).toBeInTheDocument();
      expect(mockSubmit).not.toHaveBeenCalled();

      // Enter valid data
      await user.clear(nameInput);
      await user.type(nameInput, 'Quantum Leap');
      await user.selectOptions(trackSelect, 'FinTech');
      await user.type(projectInput, 'DeFi Yield Router');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'Quantum Leap',
          track: 'FinTech',
          projectTitle: 'DeFi Yield Router',
        });
      });
    });
  });

  describe('JoinTeamCard Component', () => {
    it('validates 6-character code before submission', async () => {
      const user = userEvent.setup();
      const mockJoin = vi.fn().mockResolvedValue(undefined);

      render(<JoinTeamCard onJoin={mockJoin} />);

      const codeInput = screen.getByPlaceholderText(/e\.g\. 7K2M9X/i);
      const submitBtn = screen.getByRole('button', { name: /Join Team/i });

      // Button is disabled when length !== 6
      expect(submitBtn).toBeDisabled();

      await user.type(codeInput, 'ABC');
      expect(submitBtn).toBeDisabled();

      await user.type(codeInput, '123'); // Total 6 chars
      expect(submitBtn).not.toBeDisabled();

      await user.click(submitBtn);
      expect(mockJoin).toHaveBeenCalledWith('ABC123');
    });
  });

  describe('TeamDirectory Component', () => {
    it('renders empty message when no teams exist', () => {
      render(<TeamDirectory teams={[]} />);
      expect(screen.getByText(/No teams have formed yet/i)).toBeInTheDocument();
    });

    it('renders teams list with available spot counts', () => {
      const teams: TeamWithMembers[] = [
        {
          id: 't-1',
          name: 'Alpha Team',
          joinCode: 'ALPH01',
          leaderId: 'p-1',
          track: 'Web3',
          maxCapacity: 4,
          createdAt: '2026-10-12T00:00:00Z',
          members: [
            { id: 'm-1', teamId: 't-1', profileId: 'p-1', joinedAt: '2026-10-12T00:00:00Z' },
          ],
        },
      ];

      render(<TeamDirectory teams={teams} />);
      expect(screen.getByText('Alpha Team')).toBeInTheDocument();
      expect(screen.getByText('3 spots left')).toBeInTheDocument();
      expect(screen.getByText('Web3')).toBeInTheDocument();
    });
  });
});

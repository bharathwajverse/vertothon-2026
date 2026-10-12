import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnouncementsFeed } from './AnnouncementsFeed';
import { IncidentConsole } from './IncidentConsole';
import { CheckinDesk } from './CheckinDesk';
import * as opsService from '../../services/operationsService';
import { Announcement, Incident } from '../../types';

describe('Event Operations Unit Tests', () => {
  describe('AnnouncementsFeed', () => {
    const mockAnnouncements: Announcement[] = [
      {
        id: 'ann-1',
        title: 'Opening Ceremony Starting',
        content: 'Please proceed to Auditorium 1.',
        category: 'schedule',
        isPinned: true,
        createdAt: '2026-10-12T10:00:00Z',
      },
    ];

    it('renders broadcasted announcements with category and pinned state', () => {
      render(
        <AnnouncementsFeed
          announcements={mockAnnouncements}
          canBroadcast={false}
          onBroadcast={vi.fn()}
        />
      );

      expect(screen.getByText('Opening Ceremony Starting')).toBeInTheDocument();
      expect(screen.getByText('Please proceed to Auditorium 1.')).toBeInTheDocument();
      expect(screen.getByText('schedule')).toBeInTheDocument();
      expect(screen.getByTitle('Pinned Announcement')).toBeInTheDocument();
    });

    it('allows staff to publish an announcement broadcast', async () => {
      const user = userEvent.setup();
      const mockBroadcast = vi.fn().mockResolvedValue(undefined);

      render(
        <AnnouncementsFeed
          announcements={[]}
          canBroadcast={true}
          onBroadcast={mockBroadcast}
        />
      );

      const openFormBtn = screen.getByRole('button', { name: /\+ Broadcast Alert/i });
      await user.click(openFormBtn);

      const titleInput = screen.getByLabelText(/Announcement Title/i);
      const contentInput = screen.getByLabelText(/Message Body/i);
      const submitBtn = screen.getByRole('button', { name: /Publish/i });

      await user.type(titleInput, 'Dinner is Served');
      await user.type(contentInput, 'Food trucks are open in the courtyard.');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockBroadcast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Dinner is Served',
            content: 'Food trucks are open in the courtyard.',
            category: 'general',
          })
        );
      });
    });
  });

  describe('IncidentConsole', () => {
    const mockIncidents: Incident[] = [
      {
        id: 'inc-1',
        title: 'Power strip failure Table 4',
        description: 'Breaker tripped on table 4.',
        severity: 'high',
        status: 'open',
        createdAt: '2026-10-12T11:00:00Z',
      },
    ];

    it('renders open operational incidents and allows status advancement', async () => {
      const user = userEvent.setup();
      const mockUpdate = vi.fn().mockResolvedValue(undefined);

      render(
        <IncidentConsole
          incidents={mockIncidents}
          onReportIncident={vi.fn()}
          onUpdateStatus={mockUpdate}
        />
      );

      expect(screen.getByText('Power strip failure Table 4')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();

      const investBtn = screen.getByRole('button', { name: /Investigate/i });
      await user.click(investBtn);

      expect(mockUpdate).toHaveBeenCalledWith('inc-1', 'investigating');
    });
  });

  describe('CheckinDesk', () => {
    it('verifies attendee badge and warns on unapproved status', async () => {
      const user = userEvent.setup();
      vi.spyOn(opsService, 'verifyAndCheckInAttendee').mockResolvedValueOnce({
        success: false,
        profile: {
          id: 'user-unapproved',
          email: 'unapproved@test.com',
          fullName: 'Unapproved User',
          role: 'participant',
          registrationStatus: 'pending_review',
          createdAt: '2026-10-12T00:00:00Z',
        },
        error: 'Cannot check in: Participant registration is currently "pending_review". Must be "approved".',
      });

      render(<CheckinDesk />);

      const input = screen.getByPlaceholderText(/Scan or paste 16-hex token/i);
      const checkinBtn = screen.getByRole('button', { name: /Check In Attendee/i });

      await user.type(input, 'abcdef1234567890');
      await user.click(checkinBtn);

      await waitFor(() => {
        expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
        expect(screen.getAllByText(/pending_review/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

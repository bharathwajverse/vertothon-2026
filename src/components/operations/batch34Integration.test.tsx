import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CheckinDesk } from './CheckinDesk';
import { ParticipantPass } from '../profile/ParticipantPass';
import { NotificationCenter } from '../layout/NotificationCenter';
import * as operationsService from '../../services/operationsService';
import { UserProfile } from '../../types';

describe('Batch 3 & 4 Component Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Check-in Desk & Scanner UI', () => {
    it('renders check-in input, toggle camera scanner button, and manual input fallback', async () => {
      render(
        <MemoryRouter>
          <CheckinDesk />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Attendee QR & Badge Check-in Desk/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Scan or paste 16-hex token/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open Camera Scanner/i })).toBeInTheDocument();
    });

    it('toggles camera scanner view on clicking toggle button', async () => {
      const user = userEvent.setup();

      // Mock navigator.mediaDevices
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new Error('Test camera not available in jsdom')),
        },
        writable: true,
        configurable: true,
      });

      render(
        <MemoryRouter>
          <CheckinDesk />
        </MemoryRouter>
      );

      const toggleBtn = screen.getByTestId('toggle-camera-btn');
      await user.click(toggleBtn);

      expect(screen.getByText(/Camera Unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/Close Camera/i)).toBeInTheDocument();
    });

    it('verifies attendee upon manual token submit', async () => {
      const user = userEvent.setup();
      vi.spyOn(operationsService, 'verifyAndCheckInAttendee').mockResolvedValue({
        success: true,
        alreadyCheckedIn: false,
        profile: {
          id: 'user-123',
          email: 'participant@test.com',
          fullName: 'Siddharth Patel',
          role: 'participant',
          registrationStatus: 'approved',
          createdAt: '',
        },
      });

      render(
        <MemoryRouter>
          <CheckinDesk />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText(/Scan or paste 16-hex token/i);
      await user.type(input, '12345678abcdef00');

      const submitBtn = screen.getByRole('button', { name: /Check In Attendee/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('✓ Check-in Verified')).toBeInTheDocument();
        expect(screen.getAllByText('Siddharth Patel').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Participant Pass Component', () => {
    const mockProfile: UserProfile = {
      id: 'usr-999',
      email: 'alex@example.com',
      fullName: 'Alex Chen',
      role: 'participant',
      registrationStatus: 'approved',
      collegeOrCompany: 'Stanford AI Lab',
      createdAt: '2026-10-12',
      qrCheckinToken: 'fedcba0987654321',
    };

    it('renders participant pass badge with name, role, college, and QR code', () => {
      render(<ParticipantPass profile={mockProfile} />);

      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('participant')).toBeInTheDocument();
      expect(screen.getByText('Stanford AI Lab')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code-svg')).toBeInTheDocument();
      expect(screen.getByText(/fedcba0987654321/i)).toBeInTheDocument();
      expect(screen.getByText(/Cleared for Venue/i)).toBeInTheDocument();
    });

    it('triggers window.print when print pass button is clicked', async () => {
      const user = userEvent.setup();
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(<ParticipantPass profile={mockProfile} />);

      const printBtn = screen.getByTestId('print-pass-btn');
      await user.click(printBtn);

      expect(printSpy).toHaveBeenCalled();
    });
  });

  describe('In-App Notification Center', () => {
    it('opens notification tray and tracks unread count', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <NotificationCenter />
        </MemoryRouter>
      );

      const bellBtn = screen.getByTestId('notification-bell-btn');
      expect(screen.getByTestId('notification-badge-unread')).toBeInTheDocument();

      await user.click(bellBtn);

      expect(screen.getByTestId('notification-tray')).toBeInTheDocument();
      expect(screen.getByText('Platform Ready: VERTOTHON 2026')).toBeInTheDocument();

      const markAllBtn = screen.getByTestId('mark-all-read-btn');
      await user.click(markAllBtn);

      expect(screen.queryByTestId('notification-badge-unread')).not.toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { User } from '@supabase/supabase-js';
import { ParticipantProfileForm } from './ParticipantProfileForm';
import { OrganizerReviewQueue } from '../organizer/OrganizerReviewQueue';
import { RegistrationStatusBanner } from './RegistrationStatusBanner';
import { AuthContext } from '../../context/authContextInstance';
import * as profileService from '../../services/profileService';
import { UserProfile, UserRole } from '../../types';

// Mock profile service
vi.mock('../../services/profileService', async () => {
  const actual = await vi.importActual<typeof profileService>('../../services/profileService');
  return {
    ...actual,
    updateParticipantProfile: vi.fn(),
    fetchOrganizerApplicants: vi.fn(),
    reviewApplicantStatus: vi.fn(),
  };
});

describe('Phase 2 Task 3: Participant Onboarding and Organizer Review Workflows', () => {
  const mockUser = {
    id: 'user-part-1',
    email: 'alex@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as unknown as User;

  const mockProfile: UserProfile = {
    id: 'user-part-1',
    email: 'alex@example.com',
    fullName: 'Alex Chen',
    role: 'participant',
    registrationStatus: 'pending_review',
    collegeOrCompany: 'IIT Hyderabad',
    githubHandle: 'alexchen',
    linkedinUrl: 'https://linkedin.com/in/alexchen',
    tShirtSize: 'L',
    dietaryRestrictions: 'Vegetarian',
    createdAt: new Date().toISOString(),
  };

  const createAuthMock = (overrides = {}) => ({
    user: mockUser,
    session: null,
    profile: mockProfile,
    role: 'participant' as UserRole,
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
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ParticipantProfileForm', () => {
    it('renders form inputs prefilled with current profile data', () => {
      const authMock = createAuthMock();
      render(
        <AuthContext.Provider value={authMock}>
          <ParticipantProfileForm />
        </AuthContext.Provider>
      );

      expect(screen.getByLabelText(/Full Legal \/ Display Name/i)).toHaveValue('Alex Chen');
      expect(screen.getByLabelText(/College \/ University \/ Company/i)).toHaveValue('IIT Hyderabad');
      expect(screen.getByLabelText(/GitHub Profile \/ Handle/i)).toHaveValue('alexchen');
      expect(screen.getByLabelText(/LinkedIn Profile URL/i)).toHaveValue('https://linkedin.com/in/alexchen');
    });

    it('shows validation error when full legal name or institution is cleared', async () => {
      const authMock = createAuthMock();
      render(
        <AuthContext.Provider value={authMock}>
          <ParticipantProfileForm />
        </AuthContext.Provider>
      );

      const nameInput = screen.getByLabelText(/Full Legal \/ Display Name/i);
      fireEvent.change(nameInput, { target: { value: '' } });

      const submitBtn = screen.getByRole('button', { name: /Save & Update Profile/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Full legal or display name is required/i)).toBeInTheDocument();
      expect(profileService.updateParticipantProfile).not.toHaveBeenCalled();
    });

    it('validates invalid GitHub handle formats', async () => {
      const authMock = createAuthMock();
      render(
        <AuthContext.Provider value={authMock}>
          <ParticipantProfileForm />
        </AuthContext.Provider>
      );

      const githubInput = screen.getByLabelText(/GitHub Profile \/ Handle/i);
      fireEvent.change(githubInput, { target: { value: '-invalid-github-user-name--' } });

      const submitBtn = screen.getByRole('button', { name: /Save & Update Profile/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Please provide a valid GitHub username/i)).toBeInTheDocument();
      expect(profileService.updateParticipantProfile).not.toHaveBeenCalled();
    });

    it('submits valid profile updates and triggers updateProfileState', async () => {
      vi.mocked(profileService.updateParticipantProfile).mockResolvedValueOnce({
        data: {
          ...mockProfile,
          collegeOrCompany: 'BITS Pilani',
        },
        error: null,
      });

      const authMock = createAuthMock();
      render(
        <AuthContext.Provider value={authMock}>
          <ParticipantProfileForm />
        </AuthContext.Provider>
      );

      const collegeInput = screen.getByLabelText(/College \/ University \/ Company/i);
      fireEvent.change(collegeInput, { target: { value: 'BITS Pilani' } });

      const submitBtn = screen.getByRole('button', { name: /Save & Update Profile/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(profileService.updateParticipantProfile).toHaveBeenCalledWith('user-part-1', expect.objectContaining({
          collegeOrCompany: 'BITS Pilani',
        }));
      });

      expect(authMock.updateProfileState).toHaveBeenCalled();
      expect(await screen.findByText(/Participant profile saved successfully/i)).toBeInTheDocument();
    });

    it('renders server database error cleanly in toast alert if query fails', async () => {
      vi.mocked(profileService.updateParticipantProfile).mockResolvedValueOnce({
        data: null,
        error: new Error('PostgreSQL RLS violation: write permission denied'),
      });

      const authMock = createAuthMock();
      render(
        <AuthContext.Provider value={authMock}>
          <ParticipantProfileForm />
        </AuthContext.Provider>
      );

      const submitBtn = screen.getByRole('button', { name: /Save & Update Profile/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/PostgreSQL RLS violation: write permission denied/i)).toBeInTheDocument();
    });
  });

  describe('OrganizerReviewQueue', () => {
    it('restricts access when viewed by non-organizer participant', () => {
      const authMock = createAuthMock({ role: 'participant' });
      render(
        <AuthContext.Provider value={authMock}>
          <OrganizerReviewQueue />
        </AuthContext.Provider>
      );

      expect(screen.getByText(/Organizer Clearance Required/i)).toBeInTheDocument();
      expect(profileService.fetchOrganizerApplicants).not.toHaveBeenCalled();
    });

    it('loads and displays applicant table when authorized as lead_organizer', async () => {
      vi.mocked(profileService.fetchOrganizerApplicants).mockResolvedValueOnce({
        data: [mockProfile],
        count: 1,
        error: null,
      });

      const authMock = createAuthMock({ role: 'lead_organizer' });
      render(
        <AuthContext.Provider value={authMock}>
          <OrganizerReviewQueue />
        </AuthContext.Provider>
      );

      expect(await screen.findByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('alex@example.com')).toBeInTheDocument();
      expect(screen.getByText('IIT Hyderabad')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Waitlist/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    });

    it('opens confirmation modal and applies approval action on applicant', async () => {
      vi.mocked(profileService.fetchOrganizerApplicants).mockResolvedValueOnce({
        data: [mockProfile],
        count: 1,
        error: null,
      });

      vi.mocked(profileService.reviewApplicantStatus).mockResolvedValueOnce({
        data: { ...mockProfile, registrationStatus: 'approved' },
        error: null,
      });

      const authMock = createAuthMock({ role: 'admin' });
      render(
        <AuthContext.Provider value={authMock}>
          <OrganizerReviewQueue />
        </AuthContext.Provider>
      );

      const approveBtn = await screen.findByRole('button', { name: /Approve/i });
      fireEvent.click(approveBtn);

      // Verify confirmation modal
      expect(screen.getByText(/Confirm Decision: APPROVED/i)).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to change the status of/i)).toBeInTheDocument();

      const modalConfirmBtn = screen.getByRole('button', { name: /Confirm approved/i });
      fireEvent.click(modalConfirmBtn);

      await waitFor(() => {
        expect(profileService.reviewApplicantStatus).toHaveBeenCalledWith('user-part-1', 'approved');
      });

      expect(await screen.findByText(/Updated status for Alex Chen to "approved"/i)).toBeInTheDocument();
    });
  });

  describe('RegistrationStatusBanner', () => {
    it('renders appropriate banners for all four official registration statuses', () => {
      const { rerender } = render(<RegistrationStatusBanner status="pending_review" />);
      expect(screen.getByText(/Application Pending Review/i)).toBeInTheDocument();

      rerender(<RegistrationStatusBanner status="approved" />);
      expect(screen.getByText(/Registration Approved/i)).toBeInTheDocument();

      rerender(<RegistrationStatusBanner status="waitlisted" />);
      expect(screen.getByText(/Application On Waitlist/i)).toBeInTheDocument();

      rerender(<RegistrationStatusBanner status="rejected" />);
      expect(screen.getByText(/Application Not Accepted/i)).toBeInTheDocument();
    });
  });
});

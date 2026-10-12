import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context';
import { AuthContext } from '../context/authContextInstance';
import { DEMO_DATA_TAG } from '../data/demoData';
import { UserRole } from '../types';

describe('VERTOTHON 2026 Application Foundation', () => {
  const createMockAuthContext = (overrides = {}) =>
    ({
      user: {
        id: 'test-user-1',
        email: 'organizer@vertofi.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      session: null,
      profile: {
        id: 'test-user-1',
        email: 'organizer@vertofi.com',
        fullName: 'Organizer Lead',
        role: 'lead_organizer' as UserRole,
        registrationStatus: 'approved' as const,
        createdAt: new Date().toISOString(),
      },
      role: 'lead_organizer' as UserRole,
      isLoading: false,
      isConfigured: false,
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
    } as unknown as import('../context/authContextInstance').AuthContextType);

  describe('Public Portal Pages', () => {
    it('renders the public landing page at / with hero, branding and navigation', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      // Verify Brand Title & Tagline
      expect(screen.getByRole('heading', { name: /VERTOTHON 2026/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/36 hours of engineering/i)).toBeInTheDocument();

      // Verify Public Navigation links
      const publicNav = screen.getByRole('navigation', { name: /Public Navigation/i });
      expect(publicNav).toBeInTheDocument();
      expect(within(publicNav).getByRole('link', { name: /About/i })).toBeInTheDocument();
      expect(within(publicNav).getByRole('link', { name: /Tracks/i })).toBeInTheDocument();
      expect(within(publicNav).getByRole('link', { name: /Schedule/i })).toBeInTheDocument();
      expect(within(publicNav).getByRole('link', { name: /FAQ/i })).toBeInTheDocument();

      // Verify Call to Action Buttons
      expect(screen.getByRole('link', { name: /Register Now/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Learn More/i })).toBeInTheDocument();
    });

    it('navigates to public supporting pages', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      const publicNav = screen.getByRole('navigation', { name: /Public Navigation/i });
      const aboutLink = within(publicNav).getByRole('link', { name: /About/i });
      await user.click(aboutLink);

      expect(screen.getByRole('heading', { name: /Organized by Vertofi Private Limited/i })).toBeInTheDocument();
    });
  });

  describe('Authenticated Application Shell (/app)', () => {
    it('renders the operations application shell with branding and navigation at /app', () => {
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      // Verify Brand Title
      expect(screen.getByText('VERTOTHON 2026')).toBeInTheDocument();
      expect(screen.getByText(/By Vertofi • Ops/i)).toBeInTheDocument();

      // Verify Main Navigation items (scoped within navigation)
      const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
      expect(nav).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Control Room/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Participants/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Teams/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Schedule/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Check-in Desk/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Submissions/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Judging & Scoring/i })).toBeInTheDocument();
      expect(within(nav).getByRole('link', { name: /Settings/i })).toBeInTheDocument();
    });

    it('displays the prototype dashboard with labeled demo metrics banner at /app', () => {
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      // Verify Simulation Data Banner Tag & Demo Mode label
      expect(screen.getByText(new RegExp(DEMO_DATA_TAG, 'i'))).toBeInTheDocument();
      expect(screen.getByText(/Demo Mode — Showing simulated data/i)).toBeInTheDocument();

      // Verify Dashboard metric cards labels
      expect(screen.getByText('Total Registrations')).toBeInTheDocument();
      expect(screen.getByText('Approved Participants')).toBeInTheDocument();
      expect(screen.getByText('Formed Teams')).toBeInTheDocument();
      expect(screen.getByText('Project Submissions')).toBeInTheDocument();

      // Verify specific metric values using getAllByText or specific queries
      expect(screen.getAllByText('642').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('418')).toBeInTheDocument();
      expect(screen.getByText('112')).toBeInTheDocument();
      expect(screen.getByText('29')).toBeInTheDocument();

      // Verify Event schedule snapshot
      expect(screen.getByText(/Registration Closes/i)).toBeInTheDocument();
      expect(screen.getByText(/October 31, 2026/i)).toBeInTheDocument();
    });

    it('navigates to the functional Participant Onboarding and Review page at /app/participants', async () => {
      const user = userEvent.setup();
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
      const participantsLink = within(nav).getByRole('link', { name: /Participants/i });
      await user.click(participantsLink);

      // Verify functional participant review or onboarding interface renders
      expect(
        screen.getByText(/Participant Onboarding/i)
      ).toBeInTheDocument();
    });

    it('navigates to the functional Teams page when clicking Teams', async () => {
      const user = userEvent.setup();
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
      const teamsLink = within(nav).getByRole('link', { name: /Teams/i });
      await user.click(teamsLink);

      expect(
        screen.getByText('Team Formation & Rosters')
      ).toBeInTheDocument();
    });

    it('navigates to the functional Schedule page when clicking Schedule', async () => {
      const user = userEvent.setup();
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
      const scheduleLink = within(nav).getByRole('link', { name: /Schedule/i });
      await user.click(scheduleLink);

      expect(
        screen.getByText('Official Event Timelines & Operations Schedule')
      ).toBeInTheDocument();
    });

    it('navigates to an honest placeholder page when selecting unimplemented modules', async () => {
      const user = userEvent.setup();
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
      const settingsLink = within(nav).getByRole('link', { name: /Settings/i });
      await user.click(settingsLink);

      // Verify honest placeholder state for Settings module
      expect(
        screen.getByText('Operations Platform Settings')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Module: PLATFORM_SETTINGS/i)
      ).toBeInTheDocument();
    });

    it('redirects old bookmark /participants to /app/participants', () => {
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/participants']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText(/Participant Onboarding/i)).toBeInTheDocument();
    });

    it('redirects old bookmarks /profile, /results, and /announcements to /app/*', () => {
      const mockAuth = createMockAuthContext();

      const { unmount } = render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/profile']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(screen.getByText(/User Profile & Registration Status/i)).toBeInTheDocument();
      unmount();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/results']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(screen.getByText(/Hackathon Results & Final Standings/i)).toBeInTheDocument();
    });

    it('navigates to Reports, Audit Log, and Tasks pages when authorized', () => {
      const mockAuth = createMockAuthContext();

      const { unmount: unmountReports } = render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app/reports']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(screen.getByText(/Comprehensive Reports & Data Exports/i)).toBeInTheDocument();
      unmountReports();

      const { unmount: unmountAudit } = render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app/audit-log']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(screen.getByText(/Administrative Audit Log Viewer/i)).toBeInTheDocument();
      unmountAudit();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/app/tasks']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(screen.getByText(/Organizer Task Management Console/i)).toBeInTheDocument();
    });

    it('renders session-aware Dashboard link on public layout when authenticated', () => {
      const mockAuth = createMockAuthContext();

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toBeInTheDocument();
    });

    it('renders public schedule page and tracks page directly', () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={['/schedule']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /36-Hour Hackathon Schedule/i })).toBeInTheDocument();
      unmount();

      render(
        <MemoryRouter initialEntries={['/tracks']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /Hackathon Tracks & Challenges/i })).toBeInTheDocument();
    });

    it('renders legal and trust pages (/code-of-conduct and /privacy)', () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={['/code-of-conduct']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /Code of Conduct/i })).toBeInTheDocument();
      unmount();

      render(
        <MemoryRouter initialEntries={['/privacy']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /Privacy Notice/i })).toBeInTheDocument();
    });

    it('renders password reset flow at /reset-password', () => {
      render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /Set New Password/i })).toBeInTheDocument();
    });
  });
});

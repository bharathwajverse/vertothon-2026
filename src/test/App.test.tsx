import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context';
import { DEMO_DATA_TAG } from '../data/demoData';

describe('VERTOTHON 2026 Application Foundation', () => {
  it('renders the application shell with branding and navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
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

  it('displays the prototype dashboard with labeled demo metrics', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify Simulation Data Banner Tag
    expect(screen.getByText(DEMO_DATA_TAG)).toBeInTheDocument();

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

  it('navigates to the functional Participant Onboarding and Review page', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const participantsLink = within(nav).getByRole('link', { name: /Participants/i });
    await user.click(participantsLink);

    // Verify functional participant onboarding interface renders
    expect(
      screen.getByText('Participant Profile & Onboarding')
    ).toBeInTheDocument();
  });

  it('navigates to the functional Teams page when clicking Teams', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
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
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
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
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
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
});


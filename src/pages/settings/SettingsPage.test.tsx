import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '@supabase/supabase-js';
import { SettingsPage } from './SettingsPage';
import { AuthContext } from '../../context/authContextInstance';
import * as eventSettingsService from '../../services/eventSettingsService';
import { UserRole } from '../../types';

describe('SettingsPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(eventSettingsService, 'fetchEventSettings').mockResolvedValue({
      data: eventSettingsService.DEFAULT_EVENT_SETTINGS,
      error: null,
    });
  });

  const createAuthMock = (role: UserRole = 'admin') => ({
    user: { id: 'admin-1', email: 'admin@vertofi.com' } as unknown as User,
    session: null,
    profile: {
      id: 'admin-1',
      email: 'admin@vertofi.com',
      fullName: 'Admin User',
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

  it('renders settings fields and official 5-criteria rubric', async () => {
    render(
      <AuthContext.Provider value={createAuthMock('admin')}>
        <SettingsPage />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Operations Platform Settings')).toBeInTheDocument();
      expect(screen.getByText('Module: PLATFORM_SETTINGS')).toBeInTheDocument();
      expect(screen.getByDisplayValue('VERTOTHON 2026')).toBeInTheDocument();
      expect(screen.getByText(/Innovation & Originality/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical Complexity/i)).toBeInTheDocument();
      expect(screen.getByText(/UI\/UX & Design/i)).toBeInTheDocument();
      expect(screen.getByText(/Viability & Impact/i)).toBeInTheDocument();
      expect(screen.getByText(/Presentation & Pitch/i)).toBeInTheDocument();
    });
  });

  it('allows organizer to save settings changes', async () => {
    const user = userEvent.setup();
    const mockUpdate = vi.spyOn(eventSettingsService, 'updateEventSettings').mockResolvedValueOnce({
      data: {
        ...eventSettingsService.DEFAULT_EVENT_SETTINGS,
        eventName: 'VERTOTHON 2026 Updated',
      },
      error: null,
    });

    render(
      <AuthContext.Provider value={createAuthMock('admin')}>
        <SettingsPage />
      </AuthContext.Provider>
    );

    const saveBtn = await screen.findByRole('button', { name: /Save Operations Settings/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(screen.getByText(/Authoritative event settings updated successfully/i)).toBeInTheDocument();
    });
  });
});

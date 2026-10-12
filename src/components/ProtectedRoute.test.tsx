import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../components/ProtectedRoute';
import { AuthContext } from '../context/authContextInstance';
import { UserRole } from '../types';

describe('Route Guards (ProtectedRoute & PublicOnlyRoute)', () => {
  const createMockAuthContext = (overrides = {}) => ({
    user: null,
    session: null,
    profile: null,
    role: 'participant' as UserRole,
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
  });

  describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to /login', () => {
      const mockContext = createMockAuthContext({ user: null, isLoading: false });

      render(
        <AuthContext.Provider value={mockContext}>
          <MemoryRouter initialEntries={['/protected']}>
            <Routes>
              <Route path="/login" element={<div>Login Page Target</div>} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <div>Secret Protected Area</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Login Page Target')).toBeInTheDocument();
      expect(screen.queryByText('Secret Protected Area')).not.toBeInTheDocument();
    });

    it('renders protected content when user is authenticated with proper clearance', () => {
      const mockContext = createMockAuthContext({
        user: { id: 'u-1', email: 'organizer@vertofi.com' },
        role: 'lead_organizer',
        isLoading: false,
      });

      render(
        <AuthContext.Provider value={mockContext}>
          <MemoryRouter initialEntries={['/protected']}>
            <ProtectedRoute allowedRoles={['lead_organizer', 'admin']}>
              <div>Control Room Command Console</div>
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Control Room Command Console')).toBeInTheDocument();
    });

    it('displays access restriction message when role does not have clearance', () => {
      const mockContext = createMockAuthContext({
        user: { id: 'u-2', email: 'attendee@college.edu' },
        role: 'participant',
        isLoading: false,
      });

      render(
        <AuthContext.Provider value={mockContext}>
          <MemoryRouter initialEntries={['/admin-only']}>
            <ProtectedRoute allowedRoles={['admin', 'lead_organizer']}>
              <div>Super Admin Area</div>
            </ProtectedRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
      expect(screen.getByText(/participant/i)).toBeInTheDocument();
      expect(screen.queryByText('Super Admin Area')).not.toBeInTheDocument();
    });
  });

  describe('PublicOnlyRoute', () => {
    it('renders children when user is not authenticated', () => {
      const mockContext = createMockAuthContext({ user: null });

      render(
        <AuthContext.Provider value={mockContext}>
          <MemoryRouter>
            <PublicOnlyRoute>
              <div>Public Registration Form</div>
            </PublicOnlyRoute>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Public Registration Form')).toBeInTheDocument();
    });

    it('redirects to /app when user is already authenticated', () => {
      const mockContext = createMockAuthContext({
        user: { id: 'u-3', email: 'logged-in@example.com' },
      });

      render(
        <AuthContext.Provider value={mockContext}>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/app" element={<div>Authenticated App Target</div>} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <div>Login Form</div>
                  </PublicOnlyRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Authenticated App Target')).toBeInTheDocument();
      expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
    });
  });
});

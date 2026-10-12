import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { AuthProvider } from '../../context';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

describe('Authentication Pages & Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginPage', () => {
    it('validates empty inputs on submit', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /Sign In/i });
      await user.click(submitBtn);

      expect(screen.getByText(/Email and password are required/i)).toBeInTheDocument();
    });

    it('shows configuration notice when backend is unconfigured', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/Backend Unconfigured/i)).toBeInTheDocument();
    });
  });

  describe('RegisterPage', () => {
    it('validates password length and required inputs', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /Register as Participant/i });
      await user.click(submitBtn);
      expect(screen.getByText(/Please fill out all required fields/i)).toBeInTheDocument();

      // Enter short password
      const nameInput = screen.getByLabelText(/Full Name \*/i);
      const emailInput = screen.getByLabelText(/Email Address \*/i);
      const passwordInput = screen.getByLabelText(/Create Password \*/i);

      await user.type(nameInput, 'Taylor Swift');
      await user.type(emailInput, 'taylor@example.com');
      await user.type(passwordInput, '123');
      await user.click(submitBtn);

      expect(screen.getByText(/Password must be at least 6 characters long/i)).toBeInTheDocument();
    });
  });

  describe('ForgotPasswordPage', () => {
    it('validates email input before dispatching reset', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <AuthProvider>
            <ForgotPasswordPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
      await user.click(submitBtn);

      expect(screen.getByText(/Please enter your account email address/i)).toBeInTheDocument();
    });
  });
});

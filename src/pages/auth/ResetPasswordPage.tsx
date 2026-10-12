import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Button, Toast } from '../../components/common';
import { KeyRound, Lock, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sessionWarning, setSessionWarning] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      if (!isSupabaseConfigured) {
        setSessionWarning('Backend is unconfigured. Password update will be simulated.');
        return;
      }

      // Check if URL contains recovery parameters or active session exists
      const hash = window.location.hash;
      const isRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token');
      const { data } = await supabase.auth.getSession();

      if (!data.session && !isRecoveryHash) {
        setSessionWarning(
          'No password recovery session detected. If you clicked an email link, it may have expired. You can request a fresh recovery email.'
        );
      }
    }

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Password has been successfully updated! You can now sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-xl bg-brand-600 items-center justify-center text-white font-bold text-2xl shadow-md shadow-brand-500/20 mb-3">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Set New Password
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            VERTOTHON 2026 • Account Recovery Flow
          </p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10">
          {sessionWarning && (
            <div className="mb-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 text-amber-700">{sessionWarning}</p>
                <Link
                  to="/forgot-password"
                  className="mt-1.5 inline-block font-semibold text-amber-900 underline hover:text-amber-950"
                >
                  Request a new password reset email →
                </Link>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4">
              <Toast
                toast={{
                  id: 'reset-err',
                  type: 'error',
                  title: 'Update Error',
                  message: errorMessage,
                  duration: 0,
                }}
                onDismiss={() => setErrorMessage(null)}
              />
            </div>
          )}

          {successMessage && (
            <div className="mb-4">
              <Toast
                toast={{
                  id: 'reset-success',
                  type: 'success',
                  title: 'Password Updated',
                  message: successMessage,
                  duration: 0,
                }}
                onDismiss={() => setSuccessMessage(null)}
              />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                New Password *
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Confirm New Password *
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save New Password
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

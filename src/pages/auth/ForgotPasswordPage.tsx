import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Toast } from '../../components/common';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPasswordForEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    const { error } = await resetPasswordForEmail(email);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setMessage('Password reset instructions have been dispatched to your email.');
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
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            VERTOTHON 2026 Account Recovery
          </p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10">
          {errorMessage && (
            <div className="mb-4">
              <Toast
                toast={{
                  id: 'reset-err',
                  type: 'error',
                  title: 'Error',
                  message: errorMessage,
                  duration: 0,
                }}
                onDismiss={() => setErrorMessage(null)}
              />
            </div>
          )}

          {message && (
            <div className="mb-4">
              <Toast
                toast={{
                  id: 'reset-success',
                  type: 'success',
                  title: 'Dispatched',
                  message: message,
                  duration: 0,
                }}
                onDismiss={() => setMessage(null)}
              />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Registered Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

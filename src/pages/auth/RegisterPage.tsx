import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { Button, Toast } from '../../components/common';
import { UserPlus, Mail, KeyRound, User, Building, AlertTriangle, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading, error, clearError, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeOrCompany, setCollegeOrCompany] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const { error: signUpErr } = await signUp(email, password, {
      fullName,
      collegeOrCompany,
    });

    if (!signUpErr) {
      navigate('/app', { replace: true });
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
            Create Participant Account
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            VERTOTHON 2026 • Registration Portal
          </p>
        </div>

        {!isConfigured && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Backend Unconfigured</p>
              <p className="mt-0.5 text-amber-700">
                Supabase credentials have not been configured yet. Live registration is simulated until database keys are supplied.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10">
          {(formError || error) && (
            <div className="mb-4">
              <Toast
                toast={{
                  id: 'reg-err',
                  type: 'error',
                  title: 'Registration Error',
                  message: formError || error || undefined,
                  duration: 0,
                }}
                onDismiss={() => {
                  setFormError(null);
                  clearError();
                }}
              />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Full Name *
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Alex Morgan"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Email Address *
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="alex@university.edu"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="college"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                College or Organization
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="college"
                  type="text"
                  value={collegeOrCompany}
                  onChange={(e) => setCollegeOrCompany(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="IIIT Hyderabad / Tech Org"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Create Password *
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Register as Participant
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already registered?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

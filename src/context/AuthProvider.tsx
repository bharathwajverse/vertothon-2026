import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { AuthContext } from './authContextInstance';
import { fetchUserProfile } from '../services/profileService';

function createDefaultProfile(user: User, customRole?: UserRole): UserProfile {
  return {
    id: user.id,
    email: user.email || '',
    fullName:
      (user.user_metadata?.fullName as string) ||
      (user.user_metadata?.full_name as string) ||
      'Attendee',
    role: customRole || ((user.app_metadata?.role as UserRole) || 'participant'),
    registrationStatus: 'pending_review',
    createdAt: user.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('participant');

  const loadProfileForUser = useCallback(async (authUser: User): Promise<UserProfile> => {
    if (!isSupabaseConfigured) {
      return createDefaultProfile(authUser);
    }
    const { data: dbProfile } = await fetchUserProfile(authUser.id);
    if (dbProfile) {
      return dbProfile;
    }
    return createDefaultProfile(authUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (mounted) setError(sessionError.message);
        } else if (data?.session && mounted) {
          setSession(data.session);
          setUser(data.session.user);
          const userProfile = await loadProfileForUser(data.session.user);
          if (mounted) {
            setProfile(userProfile);
            setActiveRole(userProfile.role);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve auth session');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          setUser(newSession?.user || null);
          if (newSession?.user) {
            const userProfile = await loadProfileForUser(newSession.user);
            if (mounted) {
              setProfile(userProfile);
              setActiveRole(userProfile.role);
            }
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setActiveRole('participant');
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfileForUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      const simulatedError = new Error(
        'Supabase is not configured. Live authentication is unavailable. Please check .env.example.'
      );
      setError(simulatedError.message);
      return { error: simulatedError };
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { error: signInError };
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        const newProfile = createDefaultProfile(data.session.user);
        setProfile(newProfile);
        setActiveRole(newProfile.role);
      }
      return { error: null };
    } catch (err: unknown) {
      const authErr = err instanceof Error ? err : new Error('Unexpected authentication error');
      setError(authErr.message);
      return { error: authErr };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { fullName: string; collegeOrCompany?: string }
    ) => {
      setError(null);
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        setIsLoading(false);
        const simulatedError = new Error(
          'Supabase is not configured. Live registration is unavailable.'
        );
        setError(simulatedError.message);
        return { error: simulatedError };
      }

      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              fullName: metadata.fullName,
              collegeOrCompany: metadata.collegeOrCompany || '',
              role: 'participant',
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return { error: signUpError };
        }

        if (data?.session && data?.user) {
          setSession(data.session);
          setUser(data.user);
          const newProfile = createDefaultProfile(data.user);
          setProfile(newProfile);
          setActiveRole(newProfile.role);
        }

        return { error: null };
      } catch (err: unknown) {
        const authErr = err instanceof Error ? err : new Error('Registration failed');
        setError(authErr.message);
        return { error: authErr };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err: unknown) {
      console.error('Sign-out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setActiveRole('participant');
      setIsLoading(false);
    }
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    setError(null);
    if (!isSupabaseConfigured) {
      return {
        error: new Error('Supabase is not configured. Password recovery cannot be triggered.'),
      };
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return { error: resetError };
      }
      return { error: null };
    } catch (err: unknown) {
      const resetErr = err instanceof Error ? err : new Error('Password reset failed');
      setError(resetErr.message);
      return { error: resetErr };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setDevelopmentRole = useCallback((newRole: UserRole) => {
    setActiveRole(newRole);
    setProfile((prev) => (prev ? { ...prev, role: newRole } : null));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const userProfile = await loadProfileForUser(user);
    setProfile(userProfile);
    setActiveRole(userProfile.role);
  }, [user, loadProfileForUser]);

  const updateProfileState = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      role: activeRole,
      isLoading,
      isConfigured: isSupabaseConfigured,
      error,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      clearError,
      setDevelopmentRole,
      refreshProfile,
      updateProfileState,
    }),
    [
      user,
      session,
      profile,
      activeRole,
      isLoading,
      error,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      clearError,
      setDevelopmentRole,
      refreshProfile,
      updateProfileState,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

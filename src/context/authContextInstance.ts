import { createContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: { fullName: string; collegeOrCompany?: string }
  ) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | Error | null }>;
  clearError: () => void;
  setDevelopmentRole: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (updated: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

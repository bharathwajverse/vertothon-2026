import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { TracksPage } from './pages/public/TracksPage';
import { FaqPage } from './pages/public/FaqPage';
import { PublicSchedulePage } from './pages/public/PublicSchedulePage';
import { CodeOfConductPage } from './pages/public/CodeOfConductPage';
import { PrivacyPage } from './pages/public/PrivacyPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Protected App Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PlaceholderPage } from './pages/placeholder/PlaceholderPage';
import { ParticipantsPage } from './pages/participants/ParticipantsPage';
import { TeamsPage } from './pages/teams/TeamsPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { OperationsControlPage } from './pages/operations/OperationsControlPage';
import { SchedulePage } from './pages/schedule/SchedulePage';
import { JudgingPage } from './pages/judging/JudgingPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ResultsPage } from './pages/results/ResultsPage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';

// Guards
import { PublicOnlyRoute, ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* =========================================================================
          1. PUBLIC ROUTES (PublicLayout Shell)
         ========================================================================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/schedule" element={<PublicSchedulePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/code-of-conduct" element={<CodeOfConductPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* =========================================================================
          2. AUTHENTICATION PAGES (Stand-alone with PublicOnlyRoute guards)
         ========================================================================= */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* =========================================================================
          3. AUTHENTICATED APPLICATION AREA (/app/*)
          Protected by ProtectedRoute: Requires active user session.
         ========================================================================= */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Role-aware Control Room Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* User Profile & Registration Status */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Operational Modules */}
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="results" element={<ResultsPage />} />

        {/* Staff & Admin Only Operations */}
        <Route
          path="checkin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead_organizer', 'volunteer']}>
              <OperationsControlPage />
            </ProtectedRoute>
          }
        />

        {/* Judges & Organizers Scoring Console */}
        <Route
          path="judging"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead_organizer', 'judge']}>
              <JudgingPage />
            </ProtectedRoute>
          }
        />

        {/* Settings Module Placeholder */}
        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="Operations Platform Settings"
              description="System feature flags (payments, AI assistance), capacity limits, and organizer roles."
              plannedMilestone="Milestone 7: Hardening & Configuration"
              moduleKey="PLATFORM_SETTINGS"
            />
          }
        />
      </Route>

      {/* =========================================================================
          4. BACKWARD COMPATIBILITY REDIRECTS FOR LEGACY BOOKMARKS
         ========================================================================= */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="/participants" element={<Navigate to="/app/participants" replace />} />
      <Route path="/teams" element={<Navigate to="/app/teams" replace />} />
      <Route path="/checkin" element={<Navigate to="/app/checkin" replace />} />
      <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
      <Route path="/judging" element={<Navigate to="/app/judging" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/results" element={<Navigate to="/app/results" replace />} />
      <Route path="/announcements" element={<Navigate to="/app/announcements" replace />} />

      {/* Catch-all redirect to public homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

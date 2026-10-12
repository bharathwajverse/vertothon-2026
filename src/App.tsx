import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PlaceholderPage } from './pages/placeholder/PlaceholderPage';
import { ParticipantsPage } from './pages/participants/ParticipantsPage';
import { TeamsPage } from './pages/teams/TeamsPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { OperationsControlPage } from './pages/operations/OperationsControlPage';
import { SchedulePage } from './pages/schedule/SchedulePage';
import { JudgingPage } from './pages/judging/JudgingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { PublicOnlyRoute, ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Pages (accessible only when signed out) */}
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

      {/* Main Application Shell (Protected Layout) */}
      <Route path="/" element={<AppLayout />}>
        {/* Active Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Operational Modules with Role Guidance */}
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route
          path="checkin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead_organizer', 'volunteer']}>
              <OperationsControlPage />
            </ProtectedRoute>
          }
        />
        <Route path="projects" element={<ProjectsPage />} />
        <Route
          path="judging"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lead_organizer', 'judge']}>
              <JudgingPage />
            </ProtectedRoute>
          }
        />
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

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

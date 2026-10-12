import React from 'react';
import { useAuth } from '../../context';
import { ParticipantProfileForm } from '../../components/profile/ParticipantProfileForm';
import { RegistrationStatusBanner } from '../../components/profile/RegistrationStatusBanner';
import { Badge } from '../../components/common';

export const ProfilePage: React.FC = () => {
  const { profile, role } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Profile & Registration Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your participant profile, review status, and badge clearance for VERTOTHON 2026.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo">Role: {role}</Badge>
          {profile?.registrationStatus && (
            <Badge
              variant={
                profile.registrationStatus === 'approved'
                  ? 'success'
                  : profile.registrationStatus === 'rejected'
                  ? 'danger'
                  : 'warning'
              }
            >
              Status: {profile.registrationStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Registration Status Banner */}
      {profile && (
        <RegistrationStatusBanner status={profile.registrationStatus} />
      )}

      {/* Participant Profile Form */}
      <ParticipantProfileForm />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context';
import { ParticipantProfileForm } from '../../components/profile/ParticipantProfileForm';
import { RegistrationStatusBanner } from '../../components/profile/RegistrationStatusBanner';
import { ParticipantPass } from '../../components/profile/ParticipantPass';
import { Badge } from '../../components/common';
import { fetchUserTeam } from '../../services/teamService';
import { TeamWithMembers } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, profile, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'pass'>('profile');
  const [team, setTeam] = useState<TeamWithMembers | null>(null);

  useEffect(() => {
    if (user?.id) {
      void fetchUserTeam(user.id).then((res) => {
        if (res.data) setTeam(res.data);
      });
    }
  }, [user?.id]);

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

      {/* Tab Switcher: Profile Edit vs Check-in Pass */}
      <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold w-fit print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profile Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pass')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'pass'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          data-testid="tab-checkin-pass"
        >
          Official QR Check-in Pass
        </button>
      </div>

      {/* Registration Status Banner */}
      {profile && (
        <RegistrationStatusBanner status={profile.registrationStatus} />
      )}

      {activeTab === 'profile' ? (
        <ParticipantProfileForm />
      ) : (
        profile && <ParticipantPass profile={profile} team={team} />
      )}
    </div>
  );
};

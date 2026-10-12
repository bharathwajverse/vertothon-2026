import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { ParticipantProfileForm } from '../../components/profile/ParticipantProfileForm';
import { RegistrationStatusBanner } from '../../components/profile/RegistrationStatusBanner';
import { OrganizerReviewQueue } from '../../components/organizer/OrganizerReviewQueue';
import { Button } from '../../components/common';
import { User, ClipboardList } from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const { profile, role } = useAuth();
  const isOrganizer = role === 'admin' || role === 'lead_organizer';

  // Toggle between "My Profile & Onboarding" and "Organizer Review Queue" if organizer
  const [activeTab, setActiveTab] = useState<'profile' | 'queue'>(
    isOrganizer ? 'queue' : 'profile'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner indicating registration status */}
      {profile && (
        <RegistrationStatusBanner status={profile.registrationStatus} />
      )}

      {/* Tabs if organizer/admin */}
      {isOrganizer && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Button
            size="sm"
            variant={activeTab === 'queue' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('queue')}
          >
            <ClipboardList className="w-4 h-4 mr-1.5" />
            Organizer Review Queue
          </Button>

          <Button
            size="sm"
            variant={activeTab === 'profile' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-4 h-4 mr-1.5" />
            My Participant Onboarding
          </Button>
        </div>
      )}

      {/* Content Rendering */}
      {isOrganizer && activeTab === 'queue' ? (
        <OrganizerReviewQueue />
      ) : (
        <div className="space-y-6">
          <ParticipantProfileForm />
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { TeamDashboard } from '../../components/teams/TeamDashboard';
import { CreateTeamForm } from '../../components/teams/CreateTeamForm';
import { JoinTeamCard } from '../../components/teams/JoinTeamCard';
import { TeamDirectory } from '../../components/teams/TeamDirectory';
import {
  fetchUserTeam,
  fetchAllTeams,
  createTeam,
  joinTeamByCode,
  leaveTeam,
  removeTeamMember,
  HackathonTrack,
} from '../../services/teamService';
import { TeamWithMembers } from '../../types';

export const TeamsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTeam, setActiveTeam] = useState<TeamWithMembers | null>(null);
  const [allTeams, setAllTeams] = useState<TeamWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isApproved = profile?.registrationStatus === 'approved';
  const isPending = profile?.registrationStatus === 'pending_review';

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [userTeamRes, allTeamsRes] = await Promise.all([
        fetchUserTeam(user.id),
        fetchAllTeams(user.id),
      ]);

      if (userTeamRes.data) {
        setActiveTeam(userTeamRes.data);
      } else {
        setActiveTeam(null);
      }

      if (allTeamsRes.data) {
        setAllTeams(allTeamsRes.data);
      }
    } catch (err) {
      console.error('Error loading team data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTeam = async (data: {
    name: string;
    track: HackathonTrack;
    projectTitle?: string;
  }) => {
    if (!user) return;
    setIsProcessing(true);
    setBannerMessage(null);

    const res = await createTeam({
      name: data.name,
      track: data.track,
      projectTitle: data.projectTitle,
      leaderId: user.id,
    });

    setIsProcessing(false);

    if (res.error) {
      setBannerMessage({ type: 'error', text: res.error.message });
      throw res.error;
    }

    if (res.data) {
      setActiveTeam(res.data);
      setShowCreateForm(false);
      setBannerMessage({
        type: 'success',
        text: `Team "${res.data.name}" successfully created! Share code ${res.data.joinCode} with your teammates.`,
      });
      loadData();
    }
  };

  const handleJoinTeam = async (joinCode: string) => {
    if (!user) return;
    setIsProcessing(true);
    setBannerMessage(null);

    const res = await joinTeamByCode(joinCode, user.id);
    setIsProcessing(false);

    if (!res.success) {
      const errText = res.error || 'Failed to join team.';
      setBannerMessage({ type: 'error', text: errText });
      throw new Error(errText);
    }

    setBannerMessage({ type: 'success', text: 'You have joined the team!' });
    await loadData();
  };

  const handleLeaveTeam = async () => {
    if (!user || !activeTeam) return;
    const isLeader = activeTeam.leaderId === user.id;

    const confirmMsg = isLeader
      ? 'Are you sure you want to disband this team? All members will be removed.'
      : 'Are you sure you want to leave this team?';

    if (!window.confirm(confirmMsg)) return;

    setIsProcessing(true);
    setBannerMessage(null);

    const res = await leaveTeam(activeTeam.id, user.id, isLeader);
    setIsProcessing(false);

    if (!res.success) {
      setBannerMessage({ type: 'error', text: res.error || 'Failed to leave team.' });
      return;
    }

    setActiveTeam(null);
    setBannerMessage({
      type: 'success',
      text: isLeader ? 'Team disbanded successfully.' : 'You have left the team.',
    });
    await loadData();
  };

  const handleRemoveMember = async (memberProfileId: string) => {
    if (!activeTeam) return;
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;

    setIsProcessing(true);
    setBannerMessage(null);

    const res = await removeTeamMember(activeTeam.id, memberProfileId);
    setIsProcessing(false);

    if (!res.success) {
      setBannerMessage({ type: 'error', text: res.error || 'Failed to remove member.' });
      return;
    }

    setBannerMessage({ type: 'success', text: 'Member removed from team.' });
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Team Formation & Rosters
          </h1>
          <p className="text-sm text-slate-500">
            Form or join a hackathon team of up to 4 participants for VERTOTHON 2026.
          </p>
        </div>

        {activeTeam && (
          <Badge variant="indigo" size="md">
            Active Member of {activeTeam.name}
          </Badge>
        )}
      </div>

      {/* Notification Banner */}
      {bannerMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-sm border flex items-center justify-between ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <span>{bannerMessage.text}</span>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs font-bold uppercase underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Registration Status Warning for unapproved participants */}
      {!isApproved && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Organizer Approval Required for Team Membership
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300 mt-1">
                {isPending
                  ? 'Your participant registration is currently pending review by the organizing team. Once an organizer approves your application, you will be able to create or join a team.'
                  : 'Only verified and approved participants can join or form teams. Check your application status on the Participants tab.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading team information...</div>
      ) : activeTeam ? (
        /* State A: User is already in a team -> Render Active Team Dashboard */
        <TeamDashboard
          team={activeTeam}
          currentUserId={user?.id || ''}
          onLeaveTeam={handleLeaveTeam}
          onRemoveMember={handleRemoveMember}
          isProcessing={isProcessing}
        />
      ) : (
        /* State B: User does not have a team yet -> Join or Create options */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Join by Code */}
            <JoinTeamCard onJoin={handleJoinTeam} isSubmitting={isProcessing} />

            {/* Create Team Option */}
            {showCreateForm ? (
              <CreateTeamForm
                onSubmit={handleCreateTeam}
                onCancel={() => setShowCreateForm(false)}
                isSubmitting={isProcessing}
              />
            ) : (
              <Card className="text-center py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                  +
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Lead a New Team
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Pick a track, give your team a name, and receive a shareable 6-character code.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowCreateForm(true)}
                  disabled={!isApproved}
                >
                  Create Team
                </Button>
                {!isApproved && (
                  <p className="text-[11px] text-amber-600">Requires approved registration</p>
                )}
              </Card>
            )}
          </div>

          {/* Directory of Open Teams */}
          <div className="pt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              Explore Active Teams ({allTeams.length})
            </h3>
            <TeamDirectory teams={allTeams} />
          </div>
        </div>
      )}
    </div>
  );
};

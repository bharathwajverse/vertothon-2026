import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TeamWithMembers } from '../../types';

interface TeamDashboardProps {
  team: TeamWithMembers;
  currentUserId: string;
  onLeaveTeam: () => Promise<void>;
  onRemoveMember: (profileId: string) => Promise<void>;
  isProcessing?: boolean;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({
  team,
  currentUserId,
  onLeaveTeam,
  onRemoveMember,
  isProcessing = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isLeader = team.leaderId === currentUserId;
  const isFull = team.members.length >= team.maxCapacity;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Header Banner */}
      <Card className="border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-slate-800 dark:via-indigo-950/10 dark:to-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {team.name}
              </h2>
              <Badge variant="indigo" size="md">
                {team.track} Track
              </Badge>
              {isFull ? (
                <Badge variant="warning" size="sm">
                  Full ({team.members.length}/{team.maxCapacity})
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  {team.members.length}/{team.maxCapacity} Members
                </Badge>
              )}
            </div>
            {team.projectTitle && (
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Project Focus:</span>{' '}
                {team.projectTitle}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Created {new Date(team.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Join Code Widget */}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Team Join Code
              </p>
              <p
                data-testid="team-join-code-display"
                className="text-xl font-mono font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400"
              >
                {team.joinCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              aria-label="Copy team join code"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Member Roster Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Team Roster</h3>
            <p className="text-xs text-slate-500">
              Each team can have up to 4 participants. All members must be verified participants.
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {team.members.length} of {team.maxCapacity} spots filled
          </span>
        </div>

        {/* Member list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" role="table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Affiliation</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {team.members.map((member) => {
                const isMemberLeader = member.profileId === team.leaderId;
                const isSelf = member.profileId === currentUserId;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {member.profile?.fullName || (isSelf ? 'You' : 'Anonymous Member')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {member.profile?.email || 'Registered Participant'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isMemberLeader ? (
                        <Badge variant="indigo" size="sm">
                          Team Leader
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Member
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                      {member.profile?.collegeOrCompany || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isLeader && !isMemberLeader && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          disabled={isProcessing}
                          onClick={() => onRemoveMember(member.profileId)}
                        >
                          Remove
                        </Button>
                      )}
                      {isSelf && !isLeader && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          disabled={isProcessing}
                          onClick={onLeaveTeam}
                        >
                          Leave Team
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leader Disband / Leave Warning */}
        {isLeader && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Disband Team
              </p>
              <p className="text-xs text-rose-600/90 dark:text-rose-400">
                As the team leader, leaving will permanently delete the team and remove all members.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              disabled={isProcessing}
              onClick={onLeaveTeam}
            >
              Disband Team
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

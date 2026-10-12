import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TeamWithMembers } from '../../types';

interface TeamDirectoryProps {
  teams: TeamWithMembers[];
  onSelectTeamCode?: (code: string) => void;
}

export const TeamDirectory: React.FC<TeamDirectoryProps> = ({
  teams,
  onSelectTeamCode,
}) => {
  if (teams.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No teams have formed yet. Be the first to start a team!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {teams.map((team) => {
        const spotsRemaining = team.maxCapacity - team.members.length;
        const isFull = spotsRemaining <= 0;

        return (
          <Card key={team.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {team.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Lead by {team.members.find((m) => m.profileId === team.leaderId)?.profile?.fullName || 'Participant'}
                  </p>
                </div>
                <Badge variant={isFull ? 'neutral' : 'success'} size="sm">
                  {isFull ? 'Full' : `${spotsRemaining} spot${spotsRemaining > 1 ? 's' : ''} left`}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="indigo" size="sm">
                  {team.track}
                </Badge>
                {team.projectTitle && (
                  <span className="text-xs text-slate-600 dark:text-slate-300 italic truncate max-w-[200px]">
                    "{team.projectTitle}"
                  </span>
                )}
              </div>

              {/* Mini member avatar list */}
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Roster:</span>{' '}
                {team.members.map((m) => m.profile?.fullName || 'Member').join(', ')}
              </div>
            </div>

            {onSelectTeamCode && !isFull && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Request code from team lead</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {team.members.length}/{team.maxCapacity} Members
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

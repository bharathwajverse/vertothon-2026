import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context';
import { Card, Button, Badge } from '../../components/common';
import {
  fetchMentorRequests,
  createMentorRequest,
  claimMentorRequest,
  updateMentorRequestStatus,
} from '../../services/mentorService';
import { fetchCurrentUserTeam } from '../../services/teamService';
import { MentorRequest, MentorRequestStatus, TeamWithMembers } from '../../types';
import { LifeBuoy, Plus, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

const TOPIC_OPTIONS = [
  'AI / ML & Model Inference',
  'Smart Contracts & Web3 Integration',
  'Frontend, UI/UX & React Issues',
  'Backend, API & Database Architecture',
  'Cloud Infrastructure & Deployment',
  'Pitch Presentation & Product Deck',
  'General Technical Troubleshooting',
];

export const MentorDeskPage: React.FC = () => {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [userTeam, setUserTeam] = useState<TeamWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MentorRequestStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isStaffOrMentor =
    role === 'mentor' || role === 'admin' || role === 'lead_organizer' || role === 'volunteer';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqsRes, teamRes] = await Promise.all([
        fetchMentorRequests(undefined, statusFilter),
        user?.id ? fetchCurrentUserTeam(user.id) : Promise.resolve({ data: null, error: null }),
      ]);

      if (reqsRes.data) {
        setRequests(reqsRes.data);
      }
      if (teamRes.data) {
        setUserTeam(teamRes.data);
      }
    } catch (err) {
      console.error('Failed to load mentor requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('Please detail what assistance your team requires.');
      return;
    }

    if (!userTeam) {
      setFormError('You must be a member of a team to submit a mentor request.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await createMentorRequest(
      userTeam.id,
      user?.id || 'demo-user',
      topic,
      description.trim()
    );

    setIsSubmitting(false);

    if (res.error) {
      setFormError(res.error.message);
    } else {
      setDescription('');
      setShowCreateModal(false);
      loadData();
    }
  };

  const handleClaim = async (requestId: string) => {
    if (!user?.id) return;
    await claimMentorRequest(requestId, user.id);
    loadData();
  };

  const handleResolve = async (requestId: string) => {
    await updateMentorRequestStatus(requestId, 'resolved');
    loadData();
  };

  const getStatusBadge = (status: MentorRequestStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="warning" size="sm">Open Ticket</Badge>;
      case 'in_progress':
        return <Badge variant="info" size="sm">Mentor Assigned</Badge>;
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const openTicketsCount = requests.filter((r) => r.status === 'open').length;
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = requests.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Mentor Help Desk
          </h1>
          <p className="text-sm text-slate-500">
            Request on-demand 1:1 technical mentorship, architecture guidance, and bug triage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Request Help
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs uppercase font-bold text-amber-500">Open Tickets</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{openTicketsCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase font-bold text-cyan-500">In Progress</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{inProgressCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase font-bold text-emerald-500">Resolved Sessions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{resolvedCount}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
              statusFilter === filter
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading mentor requests...</div>
      ) : requests.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 space-y-3">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm">No mentor assistance tickets in this category.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isMyTeamTicket = userTeam?.id === req.teamId;

            return (
              <Card key={req.id} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {req.topic}
                    </h3>
                    {getStatusBadge(req.status)}
                    {isMyTeamTicket && (
                      <Badge variant="indigo" size="sm">
                        My Team
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(req.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                  <div>
                    {req.team && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Team: {req.team.name}
                      </span>
                    )}
                    {req.requester && (
                      <span className="ml-2 text-slate-400">
                        • Requested by {req.requester.fullName}
                      </span>
                    )}
                    {req.assignedMentor && (
                      <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                        • Mentor: {req.assignedMentor.fullName}
                      </span>
                    )}
                  </div>

                  {/* Actions for mentors or ticket owners */}
                  <div className="flex items-center gap-2">
                    {isStaffOrMentor && req.status === 'open' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleClaim(req.id)}
                      >
                        Claim Ticket
                      </Button>
                    )}

                    {(isStaffOrMentor || isMyTeamTicket) && req.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(req.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <Card className="max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-600" />
                Request Mentor Assistance
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {!userTeam && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs">
                ⚠️ You have not created or joined a team yet. Please form a team on the Teams tab before requesting mentorship.
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Domain
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {TOPIC_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Description & Table Location
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what your team is building, what is blocking you, steps you've tried, and your table number..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !userTeam}
                >
                  {isSubmitting ? 'Submitting...' : 'Dispatch Request'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

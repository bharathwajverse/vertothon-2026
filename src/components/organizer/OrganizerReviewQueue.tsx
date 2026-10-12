import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, RegistrationStatus } from '../../types';
import { useAuth } from '../../context/useAuth';
import {
  fetchOrganizerApplicants,
  reviewApplicantStatus,
  ReviewQueueFilters,
} from '../../services/profileService';
import { Button, Badge, Modal, Toast, SelectDropdown, ToastItem } from '../common';
import {
  Users,
  Search,
  RefreshCw,
  Github,
  Linkedin,
  ShieldAlert,
} from 'lucide-react';

export const OrganizerReviewQueue: React.FC = () => {
  const { role } = useAuth();
  const isOrganizer = role === 'admin' || role === 'lead_organizer';

  const [applicants, setApplicants] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all');

  // Confirmation Modal State
  const [pendingAction, setPendingAction] = useState<{
    applicant: UserProfile;
    newStatus: RegistrationStatus;
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastItem | null>(null);

  const loadApplicants = useCallback(async () => {
    if (!isOrganizer) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const filters: ReviewQueueFilters = {
      status: statusFilter,
      searchQuery: searchQuery,
    };

    const result = await fetchOrganizerApplicants(filters);
    setIsLoading(false);

    if (result?.error) {
      setError(result.error.message);
    } else if (result?.data) {
      setApplicants(result.data);
    } else {
      setApplicants([]);
    }
  }, [isOrganizer, statusFilter, searchQuery]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const handleConfirmStatusChange = async () => {
    if (!pendingAction) return;

    setIsActionLoading(true);
    setToast(null);

    const { applicant, newStatus } = pendingAction;
    const { error: reviewErr } = await reviewApplicantStatus(applicant.id, newStatus);

    setIsActionLoading(false);
    setPendingAction(null);

    if (reviewErr) {
      setToast({
        id: 'review-err',
        type: 'error',
        title: 'Operation Denied',
        message: reviewErr.message || 'Database rejected status change.',
      });
      return;
    }

    // Optimistically update list
    setApplicants((prev) =>
      prev.map((item) =>
        item.id === applicant.id ? { ...item, registrationStatus: newStatus } : item
      )
    );

    setToast({
      id: 'review-success',
      type: 'success',
      title: 'Action Completed',
      message: `Updated status for ${applicant.fullName} to "${newStatus.replace('_', ' ')}".`,
    });
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'waitlisted':
        return <Badge variant="warning">Waitlisted</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'pending_review':
      default:
        return <Badge variant="info">Pending Review</Badge>;
    }
  };

  if (!isOrganizer) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-amber-900">Organizer Clearance Required</h3>
        <p className="text-sm text-amber-700 mt-1 max-w-md mx-auto">
          The attendee review queue is strictly restricted to platform administrators and lead organizers. Your active role is <span className="font-semibold">{role}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          toast={toast}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Organizer Review Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate participant applications, verify credentials, and manage admission decisions for VERTOTHON 2026.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadApplicants}
            disabled={isLoading}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="sm:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or institution..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <SelectDropdown
              id="statusFilter"
              label="Filter by Status"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending_review', label: 'Pending Review Only' },
                { value: 'approved', label: 'Approved Only' },
                { value: 'waitlisted', label: 'Waitlisted Only' },
                { value: 'rejected', label: 'Rejected Only' },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as RegistrationStatus | 'all')}
            />
          </div>
        </div>
      </div>

      {/* Review Queue List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm font-medium">Loading applicant records from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <p className="text-sm font-semibold">Failed to load review queue</p>
            <p className="text-xs text-rose-500 mt-1">{error}</p>
            <Button variant="outline" size="sm" onClick={loadApplicants} className="mt-4">
              Retry Query
            </Button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No applicants match the current filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Applicant</th>
                  <th scope="col" className="px-6 py-3.5">Institution</th>
                  <th scope="col" className="px-6 py-3.5">Profiles & Links</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/75 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{app.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{app.email}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800">{app.collegeOrCompany || 'Not provided'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        T-Shirt: <span className="font-medium">{app.tShirtSize || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {app.githubHandle ? (
                          <a
                            href={`https://github.com/${app.githubHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-indigo-600 bg-slate-100 px-2 py-1 rounded"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>{app.githubHandle}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">No GitHub</span>
                        )}

                        {app.linkedinUrl && (
                          <a
                            href={app.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-blue-600 p-1"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(app.registrationStatus)}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {app.registrationStatus !== 'approved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              setPendingAction({ applicant: app, newStatus: 'approved' })
                            }
                          >
                            Approve
                          </Button>
                        )}

                        {app.registrationStatus !== 'waitlisted' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setPendingAction({ applicant: app, newStatus: 'waitlisted' })
                            }
                          >
                            Waitlist
                          </Button>
                        )}

                        {app.registrationStatus !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setPendingAction({ applicant: app, newStatus: 'rejected' })
                            }
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {pendingAction && (
        <Modal
          isOpen={true}
          title={`Confirm Decision: ${pendingAction.newStatus.toUpperCase()}`}
          onClose={() => !isActionLoading && setPendingAction(null)}
          onConfirm={handleConfirmStatusChange}
          confirmLabel={isActionLoading ? 'Saving...' : `Confirm ${pendingAction.newStatus}`}
          isDanger={pendingAction.newStatus === 'rejected'}
          isConfirmLoading={isActionLoading}
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Are you sure you want to change the status of{' '}
              <span className="font-semibold text-slate-900">
                {pendingAction.applicant.fullName}
              </span>{' '}
              ({pendingAction.applicant.email}) to{' '}
              <span className="font-semibold text-indigo-700 capitalize">
                {pendingAction.newStatus.replace('_', ' ')}
              </span>
              ?
            </p>
            <p className="text-xs text-slate-500">
              This action updates the participant’s live database record and directly affects their team formation clearance.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

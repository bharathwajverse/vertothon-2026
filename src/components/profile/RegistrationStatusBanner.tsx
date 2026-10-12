import React from 'react';
import { RegistrationStatus } from '../../types';
import { Badge } from '../common';
import { Clock, CheckCircle2, PauseCircle, XCircle } from 'lucide-react';

interface Props {
  status: RegistrationStatus;
}

export const RegistrationStatusBanner: React.FC<Props> = ({ status }) => {
  switch (status) {
    case 'approved':
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-emerald-900">Registration Approved</h3>
                <Badge variant="success">Approved</Badge>
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Congratulations! You are officially confirmed for VERTOTHON 2026. You may now form or join a hackathon team and prepare for November 14.
              </p>
            </div>
          </div>
        </div>
      );

    case 'waitlisted':
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <PauseCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-amber-900">Application On Waitlist</h3>
                <Badge variant="warning">Waitlisted</Badge>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Due to venue seating constraints at the Hyderabad venue, your application is currently on the waitlist. We will notify you if a slot opens up.
              </p>
            </div>
          </div>
        </div>
      );

    case 'rejected':
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-rose-900">Application Not Accepted</h3>
                <Badge variant="danger">Rejected</Badge>
              </div>
              <p className="text-xs text-rose-700 mt-1">
                Thank you for your interest in VERTOTHON 2026. Unfortunately, we were unable to offer you a seat for this edition.
              </p>
            </div>
          </div>
        </div>
      );

    case 'pending_review':
    default:
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-blue-900">Application Pending Review</h3>
                <Badge variant="info">Under Review</Badge>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Your profile has been submitted and is queued for verification by the Vertofi organizing team. You will be notified once reviewed.
              </p>
            </div>
          </div>
        </div>
      );
  }
};

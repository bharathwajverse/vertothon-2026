import React, { useRef } from 'react';
import { Printer, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button, Badge } from '../common';
import { UserProfile, TeamWithMembers } from '../../types';
import { QrMatrix } from '../operations/QrMatrix';

interface ParticipantPassProps {
  profile: UserProfile;
  team?: TeamWithMembers | null;
}

export const ParticipantPass: React.FC<ParticipantPassProps> = ({ profile, team }) => {
  const badgeRef = useRef<HTMLDivElement | null>(null);

  const tokenValue = profile.qrCheckinToken || profile.id;
  const isApproved = profile.registrationStatus === 'approved';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Official Participant Pass & Badge
          </h3>
          <p className="text-xs text-slate-500">
            Present this badge with QR code at the offline venue entrance (Nov 14–15, Hyderabad).
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            data-testid="print-pass-btn"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Pass / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Badge Container */}
      <div className="flex justify-center p-4">
        <div
          ref={badgeRef}
          data-testid="printable-badge"
          className="w-full max-w-md bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden print:border-2 print:shadow-none print:w-full print:max-w-none text-slate-900"
        >
          {/* Badge Top Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded">
                  Official Credential
                </span>
                <h2 className="text-2xl font-black tracking-tight mt-1">VERTOTHON 2026</h2>
                <p className="text-xs text-slate-300 font-mono">36-Hour Offline Flagship Hackathon</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center font-black text-xl text-white">
                V26
              </div>
            </div>
          </div>

          {/* Badge Body */}
          <div className="p-6 space-y-6">
            {/* Participant Name & Role */}
            <div className="border-b border-slate-200 pb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  {profile.fullName || 'Registered Attendee'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{profile.email}</p>
                {profile.collegeOrCompany && (
                  <p className="text-xs font-medium text-slate-700 mt-1">
                    {profile.collegeOrCompany}
                  </p>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-indigo-100 text-indigo-800">
                  {profile.role.replace('_', ' ')}
                </span>
                <Badge variant={isApproved ? 'success' : 'warning'}>
                  {profile.registrationStatus}
                </Badge>
              </div>
            </div>

            {/* Track & Team Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px] block">Track</span>
                <span className="font-semibold text-slate-800">
                  {team?.track || 'General / Track Open'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px] block">Team</span>
                <span className="font-semibold text-slate-800">
                  {team?.name || 'Unassigned / Solo'}
                </span>
              </div>
            </div>

            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <QrMatrix value={tokenValue} size={180} />
              <p className="text-[11px] font-mono text-slate-600 mt-3 tracking-wider text-center">
                TOKEN: <span className="font-bold text-slate-900">{tokenValue.slice(0, 16)}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Scan at Entry Desk</p>
            </div>

            {/* Security Clearance Footer */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Cleared for Venue</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-700 font-semibold">Pending Review</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px]">Hyderabad • Nov 14–15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { ShieldCheck, Lock, Database, UserCheck } from 'lucide-react';
import { EVENT_DETAILS } from '../../data/publicData';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Transparency & Compliance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Privacy Notice
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          How VERTOTHON 2026 and Vertofi Private Limited handle participant information, registration credentials, and event operations telemetry.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-lg">
            <Database className="w-5 h-5" />
            <h2>1. Information We Collect</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            When you register for VERTOTHON 2026, we collect only the necessary information required for event operations and security clearances:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc marker:text-indigo-400">
            <li><strong>Identity & Account Details:</strong> Full name, verified email address, college or organizational affiliation.</li>
            <li><strong>Participant Preferences:</strong> Dietary preferences and apparel sizing solely for on-site catering and kit distribution.</li>
            <li><strong>Professional Links (Optional):</strong> GitHub profile and LinkedIn URLs for project evaluation and team matching.</li>
            <li><strong>Submissions Data:</strong> Public repository links, summaries, and demonstration video links submitted by your team.</li>
          </ul>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-lg">
            <Lock className="w-5 h-5" />
            <h2>2. How Your Data Is Used</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Collected data is strictly used for event management purposes:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc marker:text-indigo-400">
            <li>Reviewing applications to ensure fair venue capacity distribution.</li>
            <li>Issuing encrypted QR check-in badges for physical venue access control.</li>
            <li>Facilitating mentor guidance sessions and judging evaluations.</li>
            <li>Communicating critical logistical, schedule, and safety notifications.</li>
          </ul>
          <p className="text-xs text-amber-400/90 font-medium pt-2">
            We never sell, monetize, or distribute participant contact details to third-party marketing brokers.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-lg">
            <ShieldCheck className="w-5 h-5" />
            <h2>3. Payment Guardrail & Security</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            VERTOTHON 2026 does not require payment. No payment processing integrations, credit card collectors, or bank account forms exist in this application.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All database interactions are protected by Supabase Row-Level Security (RLS) policies ensuring participants cannot read or tamper with unauthorized records.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-lg">
            <UserCheck className="w-5 h-5" />
            <h2>4. Data Retention & Participant Rights</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Participants may update their profile information at any time through the participant settings portal. Upon conclusion of VERTOTHON 2026 and audit completion, participants may request profile archival or data deletion by contacting the organizers.
          </p>
        </div>
      </div>

      <div className="pt-4 text-center text-xs text-slate-500">
        <p>Published: {EVENT_DETAILS.year} • {EVENT_DETAILS.organizer}</p>
      </div>
    </div>
  );
};

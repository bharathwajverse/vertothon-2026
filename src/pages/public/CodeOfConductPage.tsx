import { HeartHandshake, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';
import { EVENT_DETAILS } from '../../data/publicData';

export const CodeOfConductPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Community Standards
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Code of Conduct
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          VERTOTHON 2026 is dedicated to providing a safe, inclusive, harassment-free environment for everyone regardless of gender, sexual orientation, disability, physical appearance, race, or religion.
        </p>
      </div>

      {/* Main Principles */}
      <div className="space-y-8">
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-lg">
            <HeartHandshake className="w-5 h-5" />
            <h2>1. Expected Behavior</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            All participants, mentors, judges, volunteers, and staff members are expected to:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc marker:text-indigo-400">
            <li>Exercise empathy and respect in your speech and actions toward fellow builders.</li>
            <li>Collaborate openly, celebrate diverse engineering perspectives, and welcome beginners.</li>
            <li>Respect the physical and digital boundaries of all attendees, mentors, and venue staff.</li>
            <li>Care for the host venue facilities, equipment, and network resources.</li>
          </ul>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-lg">
            <AlertTriangle className="w-5 h-5" />
            <h2>2. Unacceptable Behavior & Zero Tolerance</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Harassment and disruptive behavior will not be tolerated in any form. This includes:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc marker:text-rose-400">
            <li>Offensive verbal or written comments related to gender, sexual orientation, race, disability, or physical appearance.</li>
            <li>Deliberate intimidation, stalking, following, or non-consensual photography or recording.</li>
            <li>Sustained disruption of talks, mentoring sessions, judging rounds, or ceremony presentations.</li>
            <li>Plagiarism, submission of pre-built commercial solutions, or claiming another author's work as your hackathon project.</li>
          </ul>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-lg">
            <Scale className="w-5 h-5" />
            <h2>3. Intellectual Property & Originality</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Teams retain 100% ownership of everything they create at VERTOTHON 2026. However, all project submissions must adhere strictly to academic and open-source integrity:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc marker:text-indigo-400">
            <li>Core project development must take place during the official 36-hour hackathon window.</li>
            <li>Using open-source libraries, public APIs, and pre-trained models is fully permitted and encouraged, provided they are cited in your submission documentation.</li>
            <li>Pre-existing proprietary products or code developed prior to the event cannot be submitted as new work.</li>
          </ul>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-lg">
            <ShieldCheck className="w-5 h-5" />
            <h2>4. Reporting Violations & Enforcement</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            If you experience or witness a violation of this code of conduct, please notify a VERTOTHON organizer immediately. Organizers will be identifiable on-site by staff badges and through the Operations incident portal.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Organizers reserve the right to take appropriate disciplinary actions, including issuing formal warnings, disqualifying teams from judging, or expelling offenders from the event premises without recourse.
          </p>
        </div>
      </div>

      <div className="pt-4 text-center text-xs text-slate-500">
        <p>Maintained by {EVENT_DETAILS.organizer} for VERTOTHON {EVENT_DETAILS.year}.</p>
      </div>
    </div>
  );
};

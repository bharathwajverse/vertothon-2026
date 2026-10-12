import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Target, Award, Users, ArrowRight } from 'lucide-react';
import { EVENT_DETAILS } from '../../data/publicData';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          About The Event
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Engineering the Future at VERTOTHON 2026
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          A 36-hour offline engineering hackathon bringing together builders, architects, and designers to solve substantive real-world challenges.
        </p>
      </div>

      {/* Organizer Context */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Organized by Vertofi Private Limited</h2>
            <p className="text-xs text-indigo-400 font-mono">Official Organizer • Year 2026</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          VERTOTHON 2026 is initiated and organized by <span className="font-semibold text-white">{EVENT_DETAILS.organizer}</span> to foster high-integrity technological innovation across India. We believe impactful software starts with deep collaboration between engineers, designers, and domain specialists.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed">
          Rather than superficial slide presentations, VERTOTHON focuses squarely on functional engineering, architecture quality, and working prototypes demonstrated in live evaluation rounds before industry mentors.
        </p>
      </div>

      {/* Core Objectives */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Event Mission & Purpose</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
            <div className="p-2 rounded bg-indigo-950/60 text-indigo-400 w-fit">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Substantive Challenges</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We curate real technical problem statements across Artificial Intelligence, Web3 systems, FinTech rails, HealthTech diagnostics, and Open Innovation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
            <div className="p-2 rounded bg-indigo-950/60 text-indigo-400 w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Collaborative Cohort</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Targeting up to 1,000 qualified participants (proposed capacity), fostering cross-pollination between university researchers and industry engineers.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
            <div className="p-2 rounded bg-indigo-950/60 text-indigo-400 w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Merit-Based Rubric</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scoring is strictly structured across 4 balanced pillars: Innovation (25%), Technical Architecture (25%), Real-World Viability (25%), and UX (25%).
            </p>
          </div>
        </div>
      </div>

      {/* Event Format & Status */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white">Planning & Status Transparency</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 font-medium">Proposed Dates:</span>
            <p className="text-sm font-semibold text-white mt-1">{EVENT_DETAILS.dates}</p>
            <p className="text-[11px] text-amber-400 mt-1">Pending venue & schedule sign-off</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 font-medium">Proposed Venue:</span>
            <p className="text-sm font-semibold text-white mt-1">{EVENT_DETAILS.location}</p>
            <p className="text-[11px] text-amber-400 mt-1">Subject to logistics confirmation</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 pt-2">
          Vertofi Private Limited maintains full transparency regarding event details. No fabricated statistics, sponsor endorsements, or artificial deadlines are presented.
        </p>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
        >
          <span>Register for VERTOTHON 2026</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

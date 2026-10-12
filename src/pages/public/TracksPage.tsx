import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShieldCheck, Coins, Activity, Sparkles, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import { HACKATHON_TRACKS } from '../../data/publicData';

export const TracksPage: React.FC = () => {
  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-7 h-7 text-indigo-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-7 h-7 text-indigo-400" />;
      case 'Coins':
        return <Coins className="w-7 h-7 text-indigo-400" />;
      case 'Activity':
        return <Activity className="w-7 h-7 text-indigo-400" />;
      default:
        return <Sparkles className="w-7 h-7 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Page Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          5 Core Innovation Domains
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Hackathon Tracks & Challenges
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Explore the five tracks of VERTOTHON 2026. Teams may choose any one primary track for their final submission and evaluation.
        </p>
      </div>

      {/* Tracks Breakdown List */}
      <div className="space-y-10">
        {HACKATHON_TRACKS.map((track, idx) => (
          <div
            key={track.id}
            id={track.id}
            className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-950/70 border border-indigo-800/70 flex items-center justify-center shrink-0">
                  {getTrackIcon(track.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">Track 0{idx + 1}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400">In-Person Track</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                    {track.name}
                  </h2>
                </div>
              </div>
              <p className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-md border border-indigo-800/50 self-start sm:self-auto">
                {track.tagline}
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {track.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Focus Problem Areas */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Challenge Areas</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {track.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample Inspiration Ideas */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Inspiration & Project Ideas</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {track.ideas.map((idea, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">→</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Callout */}
      <div className="bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-800/50 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to choose your track?</h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          You do not need to lock in your final track at registration. Tracks are finalized with your team prior to the code freeze.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            <span>Register for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

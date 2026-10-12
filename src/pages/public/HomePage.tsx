import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Cpu,
  Coins,
  Activity,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { EVENT_DETAILS, HACKATHON_TRACKS, FAQ_LIST } from '../../data/publicData';

export const HomePage: React.FC = () => {
  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-indigo-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-indigo-400" />;
      case 'Coins':
        return <Coins className="w-6 h-6 text-indigo-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-indigo-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  const steps = [
    {
      num: '01',
      title: 'Register',
      desc: 'Submit your individual participant profile and background details.',
    },
    {
      num: '02',
      title: 'Get Approved',
      desc: 'Organizers review applications to confirm venue capacity allocations.',
    },
    {
      num: '03',
      title: 'Form Teams',
      desc: 'Form teams of 1 to 4 members via the attendee directory or bring your squad.',
    },
    {
      num: '04',
      title: 'Build & Submit',
      desc: 'Code for 36 hours on-site, pitch to the jury, and submit your project.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(79,70,229,0.25),rgba(15,23,42,0))]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-medium text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
            <span>Applications Open for 2026 Cohort</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Hyderabad (Proposed)</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Build the Future at <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
                VERTOTHON 2026
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed">
              36 hours of engineering, intense collaboration, and breakthrough product development.
              Join builders tackling challenges across AI, Web3, FinTech, and beyond.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all duration-150"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-base font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <span>Learn More</span>
            </Link>
          </div>

          {/* Quick Stats / Highlights Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Duration</p>
              <p className="text-lg font-bold text-white mt-1">36 Hours</p>
              <p className="text-[11px] text-slate-500">In-Person Sprint</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Target Capacity</p>
              <p className="text-lg font-bold text-white mt-1">1,000</p>
              <p className="text-[11px] text-amber-400/90 font-medium">Target Cap (Proposed)</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Challenge Tracks</p>
              <p className="text-lg font-bold text-white mt-1">5 Tracks</p>
              <p className="text-[11px] text-slate-500">AI, FinTech & more</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Participation</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">Free</p>
              <p className="text-[11px] text-slate-500">100% Free of Cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Event Details Card Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Logistics & Planning
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Event Logistics Snapshot
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Details subject to confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Dates</p>
                <p className="text-base font-semibold text-white mt-0.5">{EVENT_DETAILS.dates}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  {EVENT_DETAILS.datesStatus}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Location</p>
                <p className="text-base font-semibold text-white mt-0.5">{EVENT_DETAILS.location}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  {EVENT_DETAILS.locationStatus}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Format & Duration</p>
                <p className="text-base font-semibold text-white mt-0.5">{EVENT_DETAILS.format}</p>
                <p className="text-xs text-slate-400 mt-1">Offline Non-Stop</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Capacity</p>
                <p className="text-base font-semibold text-white mt-0.5">{EVENT_DETAILS.capacity}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                  {EVENT_DETAILS.capacityStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              About The Hackathon
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              An engineering-first hackathon by Vertofi Private Limited
            </h2>
            <p className="text-slate-300 leading-relaxed">
              VERTOTHON 2026 is an intensive 36-hour offline hackathon designed to test the architectural,
              problem-solving, and implementation skills of high-caliber engineering teams.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Organized by Vertofi Private Limited, our mission is simple: provide talented developers, designers, and domain thinkers with an uncompromised environment to turn bold ideas into working software.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <span>Read Full Event Overview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
            <h3 className="font-semibold text-white text-base">Key Event Pillars</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Production-Grade Code</p>
                  <p className="text-xs text-slate-400 mt-0.5">We value actual working code, clean architectures, and live demonstrations over pitch decks.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Mentorship & Architecture Feedback</p>
                  <p className="text-xs text-slate-400 mt-0.5">Industry practitioners and senior engineers conduct structured checkpoints during the build sprint.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Fair, Multi-Criteria Judging</p>
                  <p className="text-xs text-slate-400 mt-0.5">Submissions evaluated across Innovation, Technical Depth, Viability, and User Experience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tracks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            5 Focused Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Hackathon Challenge Tracks
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Choose a domain that matches your team’s passion. Each track is designed to inspire solutions for real industry challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HACKATHON_TRACKS.map((track) => (
            <div
              key={track.id}
              className="bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col justify-between transition-colors group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center">
                  {getTrackIcon(track.iconName)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-xs text-indigo-400/90 font-medium mt-0.5">
                    {track.tagline}
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {track.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <Link
                  to="/tracks"
                  className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition"
                >
                  <span>Explore Track Challenges</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Additional Track Info Box */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-800/40 rounded-xl p-6 flex flex-col justify-center text-center space-y-4">
            <h3 className="font-bold text-white text-lg">Have a Cross-Domain Idea?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hybrid prototypes combining AI with FinTech or HealthTech are welcome to select the primary track that best represents their core innovation.
            </p>
            <div>
              <Link
                to="/tracks"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              >
                <span>View Full Track Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (4-Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Participant Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-300 text-sm">
            Four clear steps from registration to final project presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative p-6 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-mono font-bold text-indigo-400/80">
                  {step.num}
                </span>
                <h3 className="font-bold text-white text-base mt-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Schedule Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Timeline Overview
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Condensed Schedule
              </h2>
            </div>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>View Full Schedule & Milestones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Day 1 Snapshot */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Day 1 • Saturday, Nov 14 (Proposed)</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Check-in & Badge Verification</p>
                    <p className="text-slate-400 text-[11px]">Main Foyer Desk</p>
                  </div>
                  <span className="font-mono text-slate-400">08:00 AM</span>
                </li>
                <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Opening Ceremony & Briefing</p>
                    <p className="text-slate-400 text-[11px]">Auditorium 1</p>
                  </div>
                  <span className="font-mono text-slate-400">09:30 AM</span>
                </li>
                <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-indigo-300">Hacking Commences (36 Hours)</p>
                    <p className="text-slate-400 text-[11px]">Hacking Arenas A & B</p>
                  </div>
                  <span className="font-mono text-indigo-400">11:00 AM</span>
                </li>
              </ul>
            </div>

            {/* Day 2 Snapshot */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Day 2 • Sunday, Nov 15 (Proposed)</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-rose-300">Code Freeze & Submissions Lock</p>
                    <p className="text-slate-400 text-[11px]">Submissions Portal</p>
                  </div>
                  <span className="font-mono text-rose-400">12:00 PM</span>
                </li>
                <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Live Pitching & Demonstrations</p>
                    <p className="text-slate-400 text-[11px]">Presentation Stages 1-3</p>
                  </div>
                  <span className="font-mono text-slate-400">01:30 PM</span>
                </li>
                <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-emerald-300">Awards Ceremony & Closing</p>
                    <p className="text-slate-400 text-[11px]">Auditorium 1</p>
                  </div>
                  <span className="font-mono text-emerald-400">05:30 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="text-slate-300 text-sm">
            Quick answers to common questions about participating in VERTOTHON 2026.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_LIST.slice(0, 7).map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2"
            >
              <h3 className="font-semibold text-white text-base flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{item.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
                {item.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-6">
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>View All FAQs & Logistics Guidelines</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 8. Call To Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-indigo-950/80 border border-indigo-700/40 p-8 sm:p-12 text-center overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready to Build at VERTOTHON 2026?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Applications are reviewed on a rolling basis. Secure your registration early to ensure team formation and venue verification.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
              >
                <span>Register as Participant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <span>Sign In to Account</span>
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              Free to participate • No credit card required • Payments permanently disabled
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

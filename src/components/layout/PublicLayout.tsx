import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { EVENT_DETAILS } from '../../data/publicData';
import { useAuth } from '../../context';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Tracks', href: '/tracks' },
    { label: 'Schedule', href: '/schedule' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Banner for unconfirmed details warning */}
      <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-4 py-2 text-xs text-indigo-200 flex items-center justify-center gap-2 text-center">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Proposed Schedule
        </span>
        <span>
          Dates ({EVENT_DETAILS.dates}) & Venue ({EVENT_DETAILS.location}) are pending confirmation.
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
              V
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base group-hover:text-indigo-300 transition-colors">
                VERTOTHON
              </span>
              <span className="ml-1 text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Public Navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-slate-800 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-white bg-slate-800 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white bg-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Register Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand Info */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  V
                </div>
                <span className="font-bold text-white tracking-tight">VERTOTHON 2026</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A 36-hour in-person hackathon bringing together software engineers, product architects, and designers to build transformative tech.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Organized by {EVENT_DETAILS.organizer}</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
                Event
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/about" className="hover:text-white transition">About VERTOTHON</Link>
                </li>
                <li>
                  <Link to="/tracks" className="hover:text-white transition">Challenges & Tracks</Link>
                </li>
                <li>
                  <Link to="/schedule" className="hover:text-white transition">Event Timeline</Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-white transition">Frequently Asked Questions</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Guidelines & Policies */}
            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
                Policies & Trust
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/code-of-conduct" className="hover:text-white transition">Code of Conduct</Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition">Privacy Notice</Link>
                </li>
                <li className="flex items-center gap-1.5 text-slate-500 pt-1">
                  <Terminal className="w-3.5 h-3.5 text-amber-500" />
                  <span>Free Participation • No Payments</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Auth */}
            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
                Participant Portal
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/register" className="hover:text-white transition">Participant Registration</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition">Sign In to Dashboard</Link>
                </li>
                <li>
                  <Link to="/app" className="hover:text-white transition">Operations App</Link>
                </li>
              </ul>
              <div className="mt-4 p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <p className="font-medium text-slate-300">Hyderabad (Proposed)</p>
                <p className="mt-0.5 text-slate-500">Dates pending venue clearance</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {EVENT_DETAILS.year} {EVENT_DETAILS.organizer}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/code-of-conduct" className="hover:text-slate-400">Code of Conduct</Link>
              <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
              <Link to="/login" className="hover:text-slate-400">Staff & Judges</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

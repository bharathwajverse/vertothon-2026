import React from 'react';
import { Menu, X, Terminal, LogOut, LogIn } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { NAVIGATION_ITEMS } from './navigationItems';
import { useAuth } from '../../context';
import { Badge } from '../common';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();

  const currentItem = NAVIGATION_ITEMS.find((item) => {
    if (item.href === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
  });

  const pageTitle = currentItem ? currentItem.label : 'Event Operations';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'GU';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              {pageTitle}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              Demo Environment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            VERTOTHON 2026 • Offline Hackathon Platform (Nov 14–15, Hyderabad)
          </p>
        </div>
      </div>

      {/* Right Action Icons & User Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono">
          <Terminal className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden md:inline">Payments Disabled (Policy Safe)</span>
          <span className="md:hidden">Safe Mode</span>
        </div>

        <NotificationCenter />

        {user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
              {getInitials(profile?.fullName, user.email)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-slate-800 leading-none">
                  {profile?.fullName || user.email}
                </p>
                <Badge variant="info">{role}</Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign out of platform"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

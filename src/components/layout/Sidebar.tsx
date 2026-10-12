import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from './navigationItems';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context';
import { UserRole } from '../../types';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { role, setDevelopmentRole } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDevelopmentRole(e.target.value as UserRole);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-brand-500/20">
          V
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
            VERTOTHON 2026
          </h1>
          <p className="text-xs text-slate-400 font-mono">By Vertofi • Ops</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Main Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Event Operations
        </div>

        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status & Role Switcher */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
            Session Mode
          </span>
          <span className="font-mono text-[11px]">v0.1.0</span>
        </div>

        {/* Development Role Simulator */}
        <div className="pt-2 border-t border-slate-800/80">
          <label
            htmlFor="dev-role-select"
            className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Dev Role Simulator</span>
          </label>
          <select
            id="dev-role-select"
            value={role}
            onChange={handleRoleChange}
            aria-label="Development Role Simulator"
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="lead_organizer">lead_organizer</option>
            <option value="admin">admin</option>
            <option value="volunteer">volunteer</option>
            <option value="judge">judge</option>
            <option value="mentor">mentor</option>
            <option value="participant">participant</option>
          </select>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  plannedMilestone: string;
  moduleKey: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  plannedMilestone,
  moduleKey,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto my-8">
      <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Construction className="w-6 h-6 text-brand-600" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        {title}
      </h2>
      
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {description}
      </p>

      <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
        <span className="font-mono text-slate-500 font-medium">Module: {moduleKey}</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
          Scheduled for: {plannedMilestone}
        </span>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Control Room Dashboard
        </Link>
      </div>
    </div>
  );
};

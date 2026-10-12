import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { updateParticipantProfile } from '../../services/profileService';
import { Button, Toast, SelectDropdown, ToastItem } from '../common';
import { User, Building, Github, Linkedin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { T_SHIRT_OPTIONS, DIETARY_OPTIONS } from './profileConstants';

interface FormErrors {
  fullName?: string;
  collegeOrCompany?: string;
  githubHandle?: string;
  linkedinUrl?: string;
}

export const ParticipantProfileForm: React.FC = () => {
  const { profile, user, updateProfileState } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [collegeOrCompany, setCollegeOrCompany] = useState(profile?.collegeOrCompany || '');
  const [githubHandle, setGithubHandle] = useState(profile?.githubHandle || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || '');
  const [tShirtSize, setTShirtSize] = useState(profile?.tShirtSize || 'M');
  const [dietaryRestrictions, setDietaryRestrictions] = useState(profile?.dietaryRestrictions || 'No Restrictions');

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.fullName) setFullName(profile.fullName);
      if (profile.collegeOrCompany) setCollegeOrCompany(profile.collegeOrCompany);
      if (profile.githubHandle) setGithubHandle(profile.githubHandle);
      if (profile.linkedinUrl) setLinkedinUrl(profile.linkedinUrl);
      if (profile.tShirtSize) setTShirtSize(profile.tShirtSize);
      if (profile.dietaryRestrictions) setDietaryRestrictions(profile.dietaryRestrictions);
    }
  }, [profile]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full legal or display name is required.';
    }

    if (!collegeOrCompany.trim()) {
      newErrors.collegeOrCompany = 'College, university, or company affiliation is required.';
    }

    if (githubHandle.trim()) {
      // Clean handle if user pasted full URL
      const cleanHandle = githubHandle.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
      if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanHandle)) {
        newErrors.githubHandle = 'Please provide a valid GitHub username (e.g. "octocat").';
      }
    }

    if (linkedinUrl.trim()) {
      try {
        const parsed = new URL(linkedinUrl.trim().startsWith('http') ? linkedinUrl.trim() : `https://${linkedinUrl.trim()}`);
        if (!parsed.hostname.includes('linkedin.com')) {
          newErrors.linkedinUrl = 'Please provide a valid LinkedIn URL (e.g. "https://linkedin.com/in/username").';
        }
      } catch {
        newErrors.linkedinUrl = 'Please enter a valid web URL format.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setToast(null);

    // Normalize GitHub handle
    const sanitizedGithub = githubHandle.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
    const sanitizedLinkedin = linkedinUrl.trim()
      ? (linkedinUrl.trim().startsWith('http') ? linkedinUrl.trim() : `https://${linkedinUrl.trim()}`)
      : '';

    const payload = {
      fullName: fullName.trim(),
      collegeOrCompany: collegeOrCompany.trim(),
      githubHandle: sanitizedGithub,
      linkedinUrl: sanitizedLinkedin,
      tShirtSize,
      dietaryRestrictions,
    };

    if (!user) {
      setIsSubmitting(false);
      setToast({
        id: 'no-user-err',
        type: 'error',
        title: 'Authentication Required',
        message: 'No active session found. Please sign in.',
      });
      return;
    }

    const { data: updatedProfile, error } = await updateParticipantProfile(user.id, payload);

    setIsSubmitting(false);

    if (error) {
      setToast({
        id: 'save-profile-err',
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to save profile. Please try again.',
      });
      return;
    }

    if (updatedProfile) {
      updateProfileState(updatedProfile);
    } else {
      updateProfileState(payload);
    }

    setToast({
      id: 'save-profile-success',
      type: 'success',
      title: 'Profile Saved',
      message: 'Participant profile saved successfully!',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      {toast && (
        <div className="mb-6">
          <Toast
            toast={toast}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Participant Profile & Onboarding
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete your onboarding details to finalize your event credentials and eligibility for VERTOTHON 2026.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-medium self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Role & Approval Status Protected by Database</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full Legal / Display Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition ${
                  errors.fullName
                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}
          </div>

          {/* College or Company */}
          <div>
            <label htmlFor="collegeOrCompany" className="block text-sm font-semibold text-slate-700 mb-1.5">
              College / University / Company <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </span>
              <input
                id="collegeOrCompany"
                name="collegeOrCompany"
                type="text"
                value={collegeOrCompany}
                onChange={(e) => setCollegeOrCompany(e.target.value)}
                placeholder="e.g. IIT Hyderabad / Google"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition ${
                  errors.collegeOrCompany
                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.collegeOrCompany && (
              <p className="mt-1 text-xs text-rose-600">{errors.collegeOrCompany}</p>
            )}
          </div>

          {/* GitHub Handle */}
          <div>
            <label htmlFor="githubHandle" className="block text-sm font-semibold text-slate-700 mb-1.5">
              GitHub Profile / Handle
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Github className="w-4 h-4" />
              </span>
              <input
                id="githubHandle"
                name="githubHandle"
                type="text"
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value)}
                placeholder="e.g. alexchen or https://github.com/alexchen"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition ${
                  errors.githubHandle
                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.githubHandle && (
              <p className="mt-1 text-xs text-rose-600">{errors.githubHandle}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Used for team verification and project submission repository commits.
            </p>
          </div>

          {/* LinkedIn Profile */}
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-slate-700 mb-1.5">
              LinkedIn Profile URL <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Linkedin className="w-4 h-4" />
              </span>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/alexchen"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition ${
                  errors.linkedinUrl
                    ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.linkedinUrl && (
              <p className="mt-1 text-xs text-rose-600">{errors.linkedinUrl}</p>
            )}
          </div>

          {/* T-Shirt Size */}
          <div>
            <SelectDropdown
              id="tShirtSize"
              label="Event Swag T-Shirt Size"
              options={T_SHIRT_OPTIONS}
              value={tShirtSize}
              onChange={setTShirtSize}
              helperText="Distributed during onsite check-in at the Hyderabad convention center."
            />
          </div>

          {/* Dietary Restrictions */}
          <div>
            <SelectDropdown
              id="dietaryRestrictions"
              label="Dietary Requirements / Allergies"
              options={DIETARY_OPTIONS}
              value={dietaryRestrictions}
              onChange={setDietaryRestrictions}
              helperText="Catering is arranged for all 36-hour hackathon meal cycles."
            />
          </div>
        </div>

        {/* Submit Button & Status Indicator */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile updates are synced to your VERTOTHON digital pass.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Update Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

import React from 'react';
import { User, Mail, Calendar, ShieldCheck, Database, Key, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { DemoBadge } from '../common/DemoBadge';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onOpenGoogleAuth: () => void;
  isDemoMode: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenGoogleAuth,
  isDemoMode,
}) => {
  // If in guest demo mode without login, display demo analyst profile
  const profile: UserProfile = currentUser || {
    id: 'usr_guest_demo',
    email: 'demo.analyst@az-analytics.example',
    fullName: 'Guest Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    role: 'Growth Strategist',
    isDemoUser: true,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
              {profile.isDemoUser && <DemoBadge label="DEMO USER" size="sm" />}
            </div>
            <p className="text-xs text-slate-400">
              Manage your personal credentials, workspace role, and security preferences.
            </p>
          </div>

          {!currentUser && (
            <button
              onClick={onOpenGoogleAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Profile Card Requirement #20 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center">
                {profile.fullName.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{profile.email}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                {profile.role || 'Analyst'}
              </span>
              <span className="text-slate-500 font-mono">
                User ID: {profile.id.slice(0, 14)}...
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">ACCOUNT CREATION DATE</span>
            <div className="flex items-center gap-2 pt-1 font-mono">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">AUTHENTICATION METHOD</span>
            <div className="flex items-center gap-2 pt-1 font-mono">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>{profile.isDemoUser ? 'Public Demo Session' : 'Google OAuth (Supabase Ready)'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">DATA ISOLATION STATUS</span>
            <div className="flex items-center gap-2 pt-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Row-Level Security (RLS) Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400">Reports and audits are strictly linked to your unique user ID.</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">LINKED META PAGES</span>
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <span>0 Live Facebook Pages connected</span>
            </div>
            <p className="text-[11px] text-slate-400">Add Meta App ID in Settings to link production pages.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

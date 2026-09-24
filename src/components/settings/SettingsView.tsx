import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Database,
  Cloud,
  Shield,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Code,
  Globe,
} from 'lucide-react';
import { UserProfile, UserSettings } from '../../types';
import { databaseService } from '../../services/database/databaseService';
import { authService } from '../../services/auth/authService';
import { metaApiService } from '../../services/meta/metaApiService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface SettingsViewProps {
  currentUser: UserProfile | null;
  onSignOut: () => void;
  onOpenGoogleAuth: () => void;
  isDemoMode: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onSignOut,
  onOpenGoogleAuth,
  isDemoMode,
}) => {
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    weeklyDigest: true,
    reportExportFormat: 'PDF',
    preferredTheme: 'dark',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);

  const supabaseConnected = isSupabaseConfigured();
  const metaStatus = metaApiService.getConnectionStatus();

  useEffect(() => {
    if (currentUser) {
      databaseService.getUserSettings(currentUser.id).then(setSettings);
    }
  }, [currentUser]);

  const handleToggle = async (key: keyof UserSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    if (currentUser) {
      await databaseService.updateUserSettings(currentUser.id, updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings & Infrastructure</h1>
        </div>
        <p className="text-xs text-slate-400">
          Configure notification preferences, view Supabase & Cloudflare Pages integration status, and manage workspace security.
        </p>
      </div>

      {/* Cloud & Supabase Architecture Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider">
              Connected Infrastructure Status
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Backend Service Layer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Supabase Status */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase Database & Auth</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  supabaseConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {supabaseConnected ? 'CONFIGURED' : 'READY FOR KEYS'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Database schema with 8 tables, Row-Level Security (RLS), and Google OAuth policies are ready in <code>supabase/schema.sql</code>.
            </p>
            <div className="pt-1 text-[11px] text-slate-400 font-mono">
              <span>Required Env: </span>
              <span className="text-slate-300">VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY</span>
            </div>
          </div>

          {/* Meta Graph API Status */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Meta / Facebook Graph API</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                SANDBOX / DEMO
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {metaStatus.message}
            </p>
            <div className="pt-1 text-[11px] text-slate-400 font-mono">
              <span>Required Env: </span>
              <span className="text-slate-300">VITE_META_APP_ID (Proxy Tokens via Server)</span>
            </div>
          </div>
        </div>

        {/* Cloudflare Pages Deployment Note */}
        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
          <Cloud className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Cloudflare Pages & GitHub Readiness</p>
            <p className="text-slate-400 leading-relaxed">
              Build command: <code>npm run build</code> | Output directory: <code>dist</code>.
              This static bundle has zero local filesystem dependencies and deploys directly to Cloudflare Pages edge.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider">
              Notification Preferences
            </h2>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-semibold text-white">Email Audit Alerts</p>
              <p className="text-[11px] text-slate-400">Receive notifications when scheduled page audits conclude.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-800">
            <div>
              <p className="text-xs font-semibold text-white">Weekly Competitor Summary Digest</p>
              <p className="text-[11px] text-slate-400">Digest detailing shifts in competitor posting cadence and top formats.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone Requirement #19 */}
      <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-3">
          <Trash2 className="w-4 h-4" />
          <h2 className="font-bold text-sm uppercase tracking-wider">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-white">Delete User Account</h3>
            <p className="text-[11px] text-slate-400">
              Permanently delete your profile and purge all saved reports. Destructive deletion is protected until real Supabase backend is authenticated.
            </p>
          </div>

          <button
            onClick={() => setDeleteWarning(!deleteWarning)}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Delete Account
          </button>
        </div>

        {deleteWarning && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center justify-between gap-3">
            <span>
              Safety check: Live deletion requires connecting your production Supabase database. No data will be destroyed during this initial build.
            </span>
            <button
              onClick={() => setDeleteWarning(false)}
              className="text-xs font-bold underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Logout button */}
      {currentUser && (
        <div className="flex justify-end">
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      )}
    </div>
  );
};

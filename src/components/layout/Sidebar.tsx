import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BarChart3,
  BookmarkCheck,
  User,
  Settings,
  LogOut,
  X,
  Sparkles,
  Database,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
  onOpenGoogleAuth: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onSignOut,
  onOpenGoogleAuth,
  isMobileOpen,
  onCloseMobile,
}) => {
  const supabaseReady = isSupabaseConfigured();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audit', label: 'Page Audit', icon: ShieldCheck, badge: 'Core' },
    { id: 'competitor', label: 'Competitor Analysis', icon: Users },
    { id: 'performance', label: 'Performance Reports', icon: BarChart3 },
    { id: 'reports', label: 'Saved Reports', icon: BookmarkCheck },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 select-none">
      {/* Brand & Mobile close */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <div
          onClick={() => handleItemClick('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-blue-600/30">
            AZ
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight leading-none">AZ Analytics</h2>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Facebook Intelligence</span>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Status Bar */}
      <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/80">
        {currentUser ? (
          <div className="flex items-center gap-3">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full border border-blue-500/40 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.fullName.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser.fullName}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-1">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              Guest Demo Mode
            </span>
            <button
              onClick={onOpenGoogleAuth}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
          Analytics Tools
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Supabase & Cloud Architecture Status */}
      <div className="p-3 m-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase + Cloud</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              supabaseReady
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {supabaseReady ? 'Connected' : 'Ready'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Cloudflare Pages & GitHub ready. User data strictly isolated by RLS.
        </p>
      </div>

      {/* Logout & Footer */}
      <div className="p-3 border-t border-slate-800">
        {currentUser ? (
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => handleItemClick('landing')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors hover:bg-slate-800"
          >
            <span>Back to Landing Page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full bg-slate-900 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

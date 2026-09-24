import React from 'react';
import {
  Menu,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { DemoBadge } from '../common/DemoBadge';

interface NavbarProps {
  currentUser: UserProfile | null;
  isDemoMode: boolean;
  onOpenAuth: () => void;
  onOpenGoogleAuth: () => void;
  onSignOut: () => void;
  onToggleSidebar: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isDemoMode,
  onOpenAuth,
  onOpenGoogleAuth,
  onSignOut,
  onToggleSidebar,
  onSelectTab,
  activeTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-xs">
      {/* Top Demo Banner if in Demo Mode */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-amber-50 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-amber-900/50 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border border-amber-400/30 uppercase">
                DEMO MODE
              </span>
              <span className="hidden sm:inline">
                Exploring with sample data. All metrics are clearly labeled demo data.
              </span>
              <span className="sm:hidden">Sample demonstration mode.</span>
            </div>
            {!currentUser && (
              <button
                onClick={onOpenGoogleAuth}
                className="text-xs bg-white text-slate-900 hover:bg-amber-100 font-bold px-3 py-1 rounded-md transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onSelectTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-sm tracking-tight text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              AZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  AZ Analytics
                </span>
                <span className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  FB Audit
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick navigation links for desktop (when in app or landing) */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('audit')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Page Audit
          </button>
          <button
            onClick={() => onSelectTab('competitor')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'competitor'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Competitors
          </button>
          <button
            onClick={() => onSelectTab('performance')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'performance'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Saved Reports
          </button>
        </nav>

        {/* Right Actions: User or Sign In */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-800 transition-colors border border-slate-700/60"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-blue-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {currentUser.fullName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[120px] truncate">
                  {currentUser.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {currentUser.isDemoUser ? 'Demo Analyst' : 'User Account'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTab('profile')}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => onSelectTab('settings')}
                    className="w-full px-4 py-2 text-left text-xs hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings & Cloud Setup</span>
                  </button>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={onSignOut}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenGoogleAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

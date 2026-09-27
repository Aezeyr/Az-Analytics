import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { supabase } from './supabase';
import { UserProfile } from './types';
import { authService } from './services/auth/authService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { PageAuditView } from './components/audit/PageAuditView';
import { CompetitorAnalysisView } from './components/competitor/CompetitorAnalysisView';
import { PerformanceReportsView } from './components/performance/PerformanceReportsView';
import { SavedReportsView } from './components/reports/SavedReportsView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/common/AuthModal';
import { ProtectedGateModal } from './components/common/ProtectedGateModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [authError, setAuthError] = useState<string | null>(() => authService.checkUrlAuthError());
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (search.includes('error=') || hash.includes('error=')) {
        return 'landing';
      }
      if (
        hash.includes('access_token') ||
        hash.includes('refresh_token') ||
        search.includes('code=')
      ) {
        return 'dashboard';
      }
    }
    return authService.getCurrentUser() ? 'dashboard' : 'landing';
  });
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProtectedGateOpen, setIsProtectedGateOpen] = useState(false);
  const [gateFeatureDescription, setGateFeatureDescription] = useState<string>('');

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      // If user logs in while on landing, redirect to dashboard
      if (user && activeTab === 'landing') {
        setActiveTab('dashboard');
      }
    });
    return unsubscribe;
  }, [activeTab]);

  const handleOpenGoogleAuth = async () => {
    setIsSigningInGoogle(true);
    setAuthError(null);
    try {
      const res = await authService.signInWithGoogle();
      if (res?.error) {
        setAuthError(res.error);
        setIsSigningInGoogle(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed to initiate. Please try again.';
      console.error('[App] Google OAuth failed to initiate:', err);
      setAuthError(message);
      setIsSigningInGoogle(false);
    }
  };

  const handleOpenProtectedGate = (customMessage?: string) => {
    setGateFeatureDescription(
      customMessage || 'Create a free account or sign in with Google to use your own data.'
    );
    setIsProtectedGateOpen(true);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleEnterDemo = (targetTab: string = 'dashboard') => {
    setActiveTab(targetTab);
  };

  const isAuthCallback =
    typeof window !== 'undefined' &&
    Boolean(
      new URLSearchParams(window.location.search).get('code') ||
      window.location.hash.includes('access_token')
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        isDemoMode={!currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenGoogleAuth={handleOpenGoogleAuth}
        onSignOut={handleSignOut}
        onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* Global Authentication Error Alert if activeTab is not landing */}
      {authError && activeTab !== 'landing' && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-100 px-4 py-2.5 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span><b>Authentication Notice:</b> {authError}</span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-rose-300 hover:text-white p-1 rounded transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Render */}
      {isAuthCallback && !currentUser ? (
        <main className="flex-1 flex flex-col items-center justify-center min-h-[65vh] p-8 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/15 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-5 shadow-lg shadow-blue-600/10">
            <div className="w-7 h-7 border-2 border-blue-400 border-t-white rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authenticating with Google</h2>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Verifying your Google session with Supabase and launching your workspace...
          </p>
        </main>
      ) : activeTab === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onEnterDemo={handleEnterDemo}
            onOpenGoogleAuth={handleOpenGoogleAuth}
            authError={authError}
            onClearAuthError={() => setAuthError(null)}
            isSigningInGoogle={isSigningInGoogle}
          />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          {/* Dashboard Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            currentUser={currentUser}
            onSignOut={handleSignOut}
            onOpenGoogleAuth={handleOpenGoogleAuth}
            isMobileOpen={isSidebarMobileOpen}
            onCloseMobile={() => setIsSidebarMobileOpen(false)}
          />

          {/* Main Workspace Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <DashboardHome
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onOpenProtectedGate={handleOpenProtectedGate}
                isDemoMode={!currentUser}
              />
            )}

            {activeTab === 'audit' && (
              <PageAuditView
                currentUser={currentUser}
                onOpenProtectedGate={handleOpenProtectedGate}
                isDemoMode={!currentUser}
              />
            )}

            {activeTab === 'competitor' && (
              <CompetitorAnalysisView
                currentUser={currentUser}
                onOpenProtectedGate={handleOpenProtectedGate}
                isDemoMode={!currentUser}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceReportsView
                currentUser={currentUser}
                onOpenProtectedGate={handleOpenProtectedGate}
                isDemoMode={!currentUser}
              />
            )}

            {activeTab === 'reports' && (
              <SavedReportsView
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onOpenProtectedGate={handleOpenProtectedGate}
                isDemoMode={!currentUser}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onOpenGoogleAuth={handleOpenGoogleAuth}
                isDemoMode={!currentUser}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                currentUser={currentUser}
                onSignOut={handleSignOut}
                onOpenGoogleAuth={handleOpenGoogleAuth}
                isDemoMode={!currentUser}
              />
            )}
          </main>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />

      <ProtectedGateModal
        isOpen={isProtectedGateOpen}
        onClose={() => setIsProtectedGateOpen(false)}
        onGoogleSignIn={handleOpenGoogleAuth}
        description={gateFeatureDescription}
      />
    </div>
  );
}

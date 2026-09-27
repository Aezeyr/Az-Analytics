import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
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
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      console.error('[App] Google OAuth failed to initiate:', err);
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

      {/* Main View Render */}
      {activeTab === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onEnterDemo={handleEnterDemo}
            onOpenGoogleAuth={handleOpenGoogleAuth}
            onOpenEmailAuth={() => setIsAuthModalOpen(true)}
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

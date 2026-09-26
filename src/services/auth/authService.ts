import { UserProfile } from '../../types';
import {
  supabase,
  getSupabaseClient,
  getSupabaseConfig,
  isSupabaseConfigured,
  signInWithGoogleOAuth,
} from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const AUTH_STORAGE_KEY = 'az_analytics_current_user';
const AUTH_TOKEN_KEY = 'az_analytics_access_token';
type AuthStateCallback = (user: UserProfile | null) => void;

class AuthService {
  private listeners: AuthStateCallback[] = [];
  private currentUser: UserProfile | null = null;
  private initialized: boolean = false;

  constructor() {
    this.loadInitialUser();
    this.initSupabaseAuthListener();
    this.cleanupHashIfPresent();
  }

  private loadInitialUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private initSupabaseAuthListener() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient() || supabase;

      client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          if (session.access_token) {
            localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
          }
          this.setUserFromSupabase(session.user);
          this.cleanupHashIfPresent();
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          this.notify();
        }
      });

      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          this.setUserFromSupabase(session.user);
          this.cleanupHashIfPresent();
        }
      }).catch((err) => {
        console.warn('[AuthService] Could not restore Supabase session:', err);
      });
    }
  }

  private setUserFromSupabase(sbUser: SupabaseUser) {
    const email = sbUser.email || 'user@example.com';
    const metadata = sbUser.user_metadata || {};
    const fullName =
      metadata.full_name ||
      metadata.name ||
      email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase());
    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    const authenticatedUser: UserProfile = {
      id: sbUser.id,
      email,
      fullName,
      avatarUrl,
      createdAt: sbUser.created_at || new Date().toISOString(),
      role: 'Account Owner',
      isDemoUser: false, // User is not in demo mode
    };

    this.currentUser = authenticatedUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    this.notify();
  }

  private cleanupHashIfPresent() {
    if (typeof window === 'undefined') return;

    try {
      const href = window.location.href;
      const hash = window.location.hash;

      if (hash && hash.includes('error_description=')) {
        const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
        console.error('[Supabase OAuth Error]:', params.get('error_description') || params.get('error'));
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      } else if (href.endsWith('#') || href.endsWith('/#')) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }
    } catch {
      // Ignore
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public onAuthStateChange(callback: AuthStateCallback): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  public async signInWithGoogle(): Promise<{ user?: UserProfile; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        await signInWithGoogleOAuth();
        return {};
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to initiate Google sign-in';
        console.error('[Supabase OAuth Trigger Error]:', message);
        return { error: message };
      }
    }

    const mockGoogleUser: UserProfile = {
      id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
      email: 'demo.analyst@example.com',
      fullName: 'Alex Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      role: 'Growth Strategist',
      isDemoUser: false,
    };

    this.currentUser = mockGoogleUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockGoogleUser));
    this.notify();
    return { user: mockGoogleUser };
  }

  public async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient() || supabase;
        await client.auth.signOut();
      } catch (err) {
        console.warn('[AuthService] Supabase sign out warning:', err);
      }
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.notify();
  }
}

export const authService = new AuthService();

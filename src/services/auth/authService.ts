import { UserProfile } from '../../types';
import {
  supabase,
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

  /**
   * Initializes Supabase session listener.
   * Automatically handles sessions returned via PKCE or URL hash tokens.
   */
  private initSupabaseAuthListener() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Listen for auth state changes (e.g., SIGNED_IN after Google OAuth redirect)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (session.access_token) {
          localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
        }
        this.setUserFromSupabase(session.user);
        this.cleanupAuthParams();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        this.notify();
      }
    });

    // Hydrate existing session on page load/refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.setUserFromSupabase(session.user);
        this.cleanupAuthParams();
      }
    }).catch((err) => {
      console.warn('[AuthService] Could not restore Supabase session:', err);
    });
  }

  /**
   * Maps a Supabase Auth User object into AZ Analytics UserProfile.
   * Ensures isDemoUser is strictly FALSE so user accesses the full authenticated workspace.
   */
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

  /**
   * Cleans up OAuth hash fragments, error strings, or trailing # from the address bar.
   * Note: Never delete ?code= here! Supabase PKCE flow exchanges and removes it automatically.
   */
  private cleanupAuthParams() {
    if (typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      let modified = false;

      // DO NOT delete 'code'! Supabase PKCE exchange handles that after completing the exchange.

      if (url.hash) {
        if (url.hash.includes('error_description=')) {
          const params = new URLSearchParams(url.hash.startsWith('#') ? url.hash.substring(1) : url.hash);
          console.error('[Supabase OAuth Error]:', params.get('error_description') || params.get('error'));
        }
        url.hash = '';
        modified = true;
      }

      const href = window.location.href;
      if (modified || href.endsWith('#') || href.endsWith('/#')) {
        const cleanPath = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '');
        window.history.replaceState(null, document.title, cleanPath || '/');
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Reads any OAuth error returned in the URL query or hash fragment.
   */
  public checkUrlAuthError(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const url = new URL(window.location.href);

      // Check query parameters
      if (url.searchParams.has('error_description')) {
        return url.searchParams.get('error_description') || null;
      }
      if (url.searchParams.has('error')) {
        return url.searchParams.get('error') || null;
      }

      // Check hash fragment
      if (url.hash) {
        const hashStr = url.hash.startsWith('#') ? url.hash.substring(1) : url.hash;
        const hashParams = new URLSearchParams(hashStr);
        if (hashParams.has('error_description')) {
          return hashParams.get('error_description') || null;
        }
        if (hashParams.has('error')) {
          return hashParams.get('error') || null;
        }
      }
    } catch {
      // Ignore
    }
    return null;
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

  /**
   * Initiates real Google OAuth flow with Supabase.
   * Performs direct OAuth redirect to Google without mock fallback.
   */
  public async signInWithGoogle(): Promise<{ user?: UserProfile; error?: string; url?: string }> {
    try {
      const data = await signInWithGoogleOAuth();
      return { url: data?.url };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to initiate Google sign-in';
      console.error('[Supabase OAuth Trigger Error]:', message);
      return { error: message };
    }
  }

  public async signInWithEmail(email: string, password: string): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        this.setUserFromSupabase(data.user);
        return { user: this.currentUser! };
      }
      return { error: 'No user returned from authentication' };
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign in' };
    }
  }

  public async signUpWithEmail(email: string, password: string, fullName: string): Promise<{ user?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      if (data.user) {
        this.setUserFromSupabase(data.user);
        return { user: this.currentUser! };
      }
      return { error: 'Please check your email to confirm registration.' };
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign up' };
    }
  }

  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthService] Supabase sign out warning:', err);
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.notify();
  }
}

export const authService = new AuthService();

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
  private isInitialized: boolean = false;
  private urlError: string | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.loadInitialUser();
    this.initSupabaseAuthListener();
    this.initPromise = this.processAuthInit();
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
   * Cleans authentication parameters (code, error, state) and hash tokens from the address bar
   * without triggering a page reload or leaving a trailing '#' symbol.
   */
  private cleanAuthParamsFromUrl() {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      url.searchParams.delete('error_code');
      url.searchParams.delete('state');

      const search = url.searchParams.toString() ? `?${url.searchParams.toString()}` : '';
      const cleanPath = `${url.pathname}${search}`;
      window.history.replaceState(window.history.state, document.title, cleanPath || '/');
    } catch {
      // Ignore
    }
  }

  /**
   * Removes any stray trailing '#' or '/#' from the address bar.
   */
  private cleanTrailingHash() {
    if (typeof window === 'undefined') return;
    try {
      const href = window.location.href;
      if (href.endsWith('#') || href.endsWith('/#') || window.location.hash === '#') {
        const cleanPath = window.location.pathname + (window.location.search || '');
        window.history.replaceState(window.history.state, document.title, cleanPath || '/');
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Initializes Supabase session listener for live auth events (e.g. sign-in, token refresh, sign-out).
   */
  private initSupabaseAuthListener() {
    if (typeof window === 'undefined') return;

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (session.access_token) {
          localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
        }
        this.setUserFromSupabase(session.user);
        this.cleanTrailingHash();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        this.notify();
      }
    });
  }

  /**
   * Comprehensive authentication initialization:
   * 1. Inspects URL for OAuth error parameters and records them.
   * 2. Inspects hash for implicit tokens (#access_token=...) and sets session.
   * 3. Inspects query for PKCE code (?code=...) and exchanges it for a session.
   * 4. Hydrates and verifies the active Supabase session.
   * 5. Cleans URL parameters cleanly without leaving '#'.
   */
  private async processAuthInit(): Promise<void> {
    if (typeof window === 'undefined') {
      this.isInitialized = true;
      return;
    }

    try {
      // 1. Check for error in query or hash fragment
      const detectedError = this.checkUrlAuthError();
      if (detectedError) {
        this.urlError = detectedError;
        this.cleanAuthParamsFromUrl();
        this.cleanTrailingHash();
        this.notify();
        return;
      }

      // 2. Handle Implicit Grant callback (#access_token=...&refresh_token=...)
      // If Supabase returned tokens in hash fragment, set session directly
      if (window.location.hash && window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (!error && data?.session?.user) {
            this.setUserFromSupabase(data.session.user);
            this.cleanAuthParamsFromUrl();
            this.cleanTrailingHash();
            return;
          } else if (error) {
            console.error('[AuthService] Error setting session from hash tokens:', error);
            this.urlError = error.message;
          }
        }
      }

      // 3. Handle PKCE OAuth callback (?code=...)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        // First check if GoTrue client already exchanged the code
        const { data: currentSessionData } = await supabase.auth.getSession();
        if (currentSessionData?.session?.user) {
          this.setUserFromSupabase(currentSessionData.session.user);
          this.cleanAuthParamsFromUrl();
          this.cleanTrailingHash();
          return;
        }

        // If not yet hydrated, explicitly exchange code for session
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data?.session?.user) {
            this.setUserFromSupabase(data.session.user);
            this.cleanAuthParamsFromUrl();
            this.cleanTrailingHash();
            return;
          } else if (error) {
            // Check retry session in case GoTrue processed it concurrently
            const retrySession = await supabase.auth.getSession();
            if (retrySession.data?.session?.user) {
              this.setUserFromSupabase(retrySession.data.session.user);
              this.cleanAuthParamsFromUrl();
              this.cleanTrailingHash();
              return;
            }
            console.error('[AuthService] PKCE exchange error:', error.message);
            this.urlError = error.message;
          }
        } catch (exchangeErr: any) {
          console.warn('[AuthService] Exception exchanging code for session:', exchangeErr);
          const retrySession = await supabase.auth.getSession();
          if (retrySession.data?.session?.user) {
            this.setUserFromSupabase(retrySession.data.session.user);
            this.cleanAuthParamsFromUrl();
            this.cleanTrailingHash();
            return;
          }
          this.urlError = exchangeErr?.message || 'Failed to complete Google authentication code exchange.';
        }
        this.cleanAuthParamsFromUrl();
      }

      // 4. Hydrate existing persisted session on page load / refresh
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (session?.user) {
        this.setUserFromSupabase(session.user);
      } else {
        // If Supabase has no active session, clear any stale cached user
        if (this.currentUser) {
          this.currentUser = null;
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          this.notify();
        }
      }

      if (sessionError) {
        console.warn('[AuthService] Could not restore Supabase session:', sessionError);
      }
    } catch (err: any) {
      console.error('[AuthService] Unexpected initialization error:', err);
    } finally {
      this.isInitialized = true;
      this.cleanTrailingHash();
      this.notify();
    }
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

  public isReady(): boolean {
    return this.isInitialized;
  }

  public async waitForInit(): Promise<{ user: UserProfile | null; error: string | null }> {
    await this.initPromise;
    return { user: this.currentUser, error: this.urlError };
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

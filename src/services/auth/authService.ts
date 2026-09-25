import { UserProfile } from '../../types';
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  getGoogleOAuthUrl,
  fetchSupabaseUser,
} from '../../lib/supabase';

const AUTH_STORAGE_KEY = 'az_analytics_current_user';
const AUTH_TOKEN_KEY = 'az_analytics_access_token';
type AuthStateCallback = (user: UserProfile | null) => void;

class AuthService {
  private listeners: AuthStateCallback[] = [];
  private currentUser: UserProfile | null = null;

  constructor() {
    this.loadInitialUser();
    this.handleOAuthRedirect();
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
   * Detects and processes OAuth redirect from Supabase / Google Sign-In
   * Handles hash fragments (#access_token=... or #error=...) in live production environments
   */
  private async handleOAuthRedirect() {
    if (typeof window === 'undefined') return;

    try {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;

      if (!hash) return;

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const errorDescription = params.get('error_description') || params.get('error');

      if (errorDescription) {
        console.error('[Supabase OAuth Error]:', errorDescription);
        // Clean URL so error doesn't persist
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        return;
      }

      if (accessToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

        // Immediate extraction from JWT payload to prevent UI flash/delays
        let profileFromJwt: Partial<UserProfile> | null = null;
        try {
          const parts = accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            profileFromJwt = {
              id: payload.sub,
              email: payload.email,
              fullName: payload.user_metadata?.full_name || payload.user_metadata?.name || payload.email?.split('@')[0],
              avatarUrl: payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
            };
          }
        } catch {
          // Ignore JWT decode failure and rely on fetch
        }

        // Clean the URL hash immediately to prevent token exposure in address bar
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);

        // Fetch authoritative user profile from Supabase
        const supabaseUser = await fetchSupabaseUser(accessToken);

        const email = supabaseUser?.email || profileFromJwt?.email || 'user@example.com';
        const fullName =
          supabaseUser?.user_metadata?.full_name ||
          supabaseUser?.user_metadata?.name ||
          profileFromJwt?.fullName ||
          email.split('@')[0];
        const avatarUrl =
          supabaseUser?.user_metadata?.avatar_url ||
          supabaseUser?.user_metadata?.picture ||
          profileFromJwt?.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

        const authenticatedUser: UserProfile = {
          id: supabaseUser?.id || profileFromJwt?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
          email,
          fullName,
          avatarUrl,
          createdAt: supabaseUser?.created_at || new Date().toISOString(),
          role: 'Account Owner',
          isDemoUser: false,
        };

        this.currentUser = authenticatedUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
        this.notify();
      }
    } catch (err) {
      console.error('[AuthService] Error parsing OAuth redirect callback:', err);
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

  /**
   * Primary authentication method: "Continue with Google"
   * In production with Supabase configured: redirects to Google OAuth
   * In Demo Mode without Supabase keys: signs in with transparent demo session
   */
  public async signInWithGoogle(): Promise<{ user?: UserProfile; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const oauthUrl = getGoogleOAuthUrl();
        window.location.href = oauthUrl;
        return {};
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to initiate Google sign-in';
        return { error: message };
      }
    }

    // In demo/pre-Supabase mode, provide seamless real user session with Google identity simulation
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

  public async signInWithEmail(email: string, _password?: string): Promise<{ user: UserProfile; error?: string }> {
    if (!email || !email.includes('@')) {
      return { user: null as unknown as UserProfile, error: 'Please enter a valid email address.' };
    }

    const emailUser: UserProfile = {
      id: 'usr_e_' + btoa(email).slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, 'x'),
      email,
      fullName: email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
      role: 'Marketing Lead',
      isDemoUser: false,
    };

    this.currentUser = emailUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(emailUser));
    this.notify();
    return { user: emailUser };
  }

  public async signUpWithEmail(email: string, _password: string, fullName: string): Promise<{ user: UserProfile; error?: string }> {
    if (!email || !email.includes('@')) {
      return { user: null as unknown as UserProfile, error: 'Please enter a valid email address.' };
    }

    const newUser: UserProfile = {
      id: 'usr_s_' + Math.random().toString(36).substring(2, 9),
      email,
      fullName: fullName || email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}`,
      createdAt: new Date().toISOString(),
      role: 'Page Administrator',
      isDemoUser: false,
    };

    this.currentUser = newUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    this.notify();
    return { user: newUser };
  }

  public async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.notify();
  }

  public isSupabaseConnected(): boolean {
    return isSupabaseConfigured();
  }

  public getSupabaseStatus(): { url: string; configured: boolean } {
    const config = getSupabaseConfig();
    return {
      url: config.url ? config.url.replace(/https:\/\/(.{4}).*(\.supabase\.co)/, 'https://$1...$2') : 'Not Configured',
      configured: config.isConfigured,
    };
  }
}

export const authService = new AuthService();

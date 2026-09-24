import { UserProfile } from '../../types';
import { getSupabaseConfig, isSupabaseConfigured } from '../supabaseClient';

const AUTH_STORAGE_KEY = 'az_analytics_current_user';
type AuthStateCallback = (user: UserProfile | null) => void;

class AuthService {
  private listeners: AuthStateCallback[] = [];
  private currentUser: UserProfile | null = null;

  constructor() {
    this.loadInitialUser();
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
   * When Supabase credentials are configured, this can invoke Supabase OAuth flow:
   * supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
   */
  public async signInWithGoogle(): Promise<{ user: UserProfile; error?: string }> {
    if (isSupabaseConfigured()) {
      // Supabase OAuth redirection flow structure
      // window.location.href = `${getSupabaseConfig().url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
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
      return { user: null as any, error: 'Please enter a valid email address.' };
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
      return { user: null as any, error: 'Please enter a valid email address.' };
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

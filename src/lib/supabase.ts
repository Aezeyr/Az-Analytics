/**
 * Supabase Client & OAuth Configuration for AZ Analytics
 * Cloudflare Pages & Production Environment Ready
 *
 * Environment variables:
 * - VITE_SUPABASE_URL: Your Supabase Project URL (e.g. https://xyz.supabase.co)
 * - VITE_SUPABASE_ANON_KEY: Your Supabase Anonymous/Public API Key
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    anonKey.length > 20
  );

  return {
    url,
    anonKey,
    isConfigured,
  };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

/**
 * Builds the Google OAuth authorize URL for Supabase Auth GoTrue.
 * Redirects cleanly back to the application's origin/current pathname on Cloudflare Pages.
 */
export const getGoogleOAuthUrl = (redirectTo?: string): string => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    throw new Error('Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  }

  // Use the current origin and path, stripping hashes and query parameters for clean callback
  const targetRedirect =
    redirectTo ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, '') || window.location.origin
      : '');

  const params = new URLSearchParams({
    provider: 'google',
    redirect_to: targetRedirect,
    apikey: config.anonKey,
  });

  return `${config.url}/auth/v1/authorize?${params.toString()}`;
};

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    [key: string]: unknown;
  };
  created_at?: string;
}

/**
 * Fetches user profile from Supabase Auth REST endpoint using access token
 */
export const fetchSupabaseUser = async (accessToken: string): Promise<SupabaseAuthUser | null> => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  try {
    const res = await fetch(`${config.url}/auth/v1/user`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.warn('[Supabase Auth] Failed to fetch user profile:', res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('[Supabase Auth] Network error fetching user profile:', err);
    return null;
  }
};

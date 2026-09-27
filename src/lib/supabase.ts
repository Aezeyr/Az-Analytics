import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

// Configured Supabase project credentials (with environment variable support)
const DEFAULT_SUPABASE_URL = 'https://svsvhoaeqhrylknunkra.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_K_MbKjRgK_wqrehjecb6_w_6UzLS0MD';

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim().replace(/\/+$/, '');
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

const config = getSupabaseConfig();

export const supabase: SupabaseClient = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export const getSupabaseClient = (): SupabaseClient => {
  return supabase;
};

export const signInWithGoogleOAuth = async (customRedirectTo?: string) => {
  const redirectTarget =
    customRedirectTo ||
    (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTarget,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    console.error('[Supabase OAuth Error]:', error.message);
    throw error;
  }

  if (data?.url && typeof window !== 'undefined') {
    // Attempt top-level navigation first to prevent iframe embedding blocks from Google OAuth
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = data.url;
      } else {
        window.location.assign(data.url);
      }
    } catch {
      window.location.assign(data.url);
    }
  }

  return data;
};

export const getGoogleOAuthUrl = (): string => {
  const config = getSupabaseConfig();
  const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '';
  return `${config.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
};

export const fetchSupabaseUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

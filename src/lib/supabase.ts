import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

  return { url, anonKey, isConfigured };
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (!cachedClient) {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  }
  return cachedClient;
};

export const supabase: SupabaseClient = (() => {
  const active = getSupabaseClient();
  if (active) return active;

  return createClient(
    'https://placeholder-project.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
})();

export const signInWithGoogleOAuth = async (customRedirectTo?: string) => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    throw new Error('Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  }

  const client = getSupabaseClient() || supabase;
  const redirectTarget =
    customRedirectTo ||
    (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined);

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTarget,
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
    window.location.assign(data.url);
  }

  return data;
};

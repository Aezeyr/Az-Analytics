/**
 * Supabase Client Configuration
 * 
 * In production or once configured, you can provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * in your environment variables.
 * 
 * IMPORTANT SECURITY NOTE:
 * - Only the anon/publishable key is used in frontend client code.
 * - Never use the service-role key on the client!
 */

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
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

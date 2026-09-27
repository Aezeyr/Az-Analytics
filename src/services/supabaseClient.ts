/**
 * Supabase Client Configuration
 * Re-exports from src/lib/supabase for unified access across services
 */

export {
  supabase,
  getSupabaseClient,
  getSupabaseConfig,
  isSupabaseConfigured,
  signInWithGoogleOAuth,
  getGoogleOAuthUrl,
  fetchSupabaseUser,
} from '../lib/supabase';
export type { SupabaseConfig } from '../lib/supabase';

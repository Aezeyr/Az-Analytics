/**
 * Supabase Client Configuration
 * Re-exports from src/lib/supabase for backwards compatibility
 */

export {
  getSupabaseConfig,
  isSupabaseConfigured,
  getGoogleOAuthUrl,
  fetchSupabaseUser,
} from '../lib/supabase';
export type { SupabaseConfig, SupabaseAuthUser } from '../lib/supabase';

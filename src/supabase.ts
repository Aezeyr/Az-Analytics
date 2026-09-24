import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://svsvhoaeqhrylknunkra.supabase.co'
const supabaseAnonKey = 'sb_publishable_K_MbKjRgK_wqrehjecb6_w_6UzLS0MD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

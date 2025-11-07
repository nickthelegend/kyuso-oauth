import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Initialize tables
export async function initTables() {
  // Create clients table
  await supabaseAdmin.from('oauth_clients').select('*').limit(1)
  
  // Create auth_codes table  
  await supabaseAdmin.from('oauth_auth_codes').select('*').limit(1)
  
  // Create refresh_tokens table
  await supabaseAdmin.from('oauth_refresh_tokens').select('*').limit(1)
}
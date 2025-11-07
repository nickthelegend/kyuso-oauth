import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export const supabase = createClient("https://aenewsmgmizwiutdazex.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbmV3c21nbWl6d2l1dGRhemV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTkyMDEsImV4cCI6MjA3Nzg5NTIwMX0._KiAVa8HvXMG_EAETvcrsf6JZPlIUCtccrJX6VA9JaM")
export const supabaseAdmin = createClient("https://aenewsmgmizwiutdazex.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbmV3c21nbWl6d2l1dGRhemV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMxOTIwMSwiZXhwIjoyMDc3ODk1MjAxfQ.WyVfRxLtf2T96xSypAF4UxE159hPXsjq9m574VMyPZY")

// Initialize tables
export async function initTables() {
  // Create clients table
  await supabaseAdmin.from('oauth_clients').select('*').limit(1)
  
  // Create auth_codes table  
  await supabaseAdmin.from('oauth_auth_codes').select('*').limit(1)
  
  // Create refresh_tokens table
  await supabaseAdmin.from('oauth_refresh_tokens').select('*').limit(1)
}
import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise use hardcoded values for mobile
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTY0MjgsImV4cCI6MjA3MzE5MjQyOH0.-PUsHS8-OaZSj2W163hGGci6fAx24pFB1vDKCHDro6Q'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg'

// Check if we're in a mobile environment
const isMobile = typeof window !== 'undefined' && (
  window.navigator.userAgent.includes('Mobile') || 
  window.navigator.userAgent.includes('Android') ||
  window.navigator.userAgent.includes('iPhone')
);

// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto refresh for mobile to avoid issues
    autoRefreshToken: !isMobile,
    persistSession: !isMobile,
    detectSessionInUrl: false
  }
})

// Client for admin operations (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey;
}
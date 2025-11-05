import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Pick service role key (for backend privileged access), otherwise fallback to anon
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are missing.');
  console.error('Required: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

// ✅ Create the client first
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// ✅ Then expose it to the browser console
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

// Optional: Export a user-facing client (with anon key) for limited access
export const supabasePublic: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export default supabase;

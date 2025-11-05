import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create a dummy client if env vars are missing (prevents app crash)
// This allows the app to load and show proper error messages
let supabase: ReturnType<typeof createClient>;

if (!supabaseUrl || !supabaseAnon || supabaseUrl === "your_supabase_project_url" || supabaseAnon === "your_supabase_anon_key") {
  console.warn("⚠️ Missing or placeholder Supabase environment variables!");
  console.warn("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file");
  // Create a dummy client with placeholder values to prevent crash
  supabase = createClient("https://placeholder.supabase.co", "placeholder-key", {
    auth: {
      persistSession: false,
    },
  });
} else {
  supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: true, // browser saves the session
    },
  });
}

export { supabase };
export default supabase;

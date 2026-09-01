import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server credentials. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

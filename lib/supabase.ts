import { createClient } from "@supabase/supabase-js";

let cachedClient: ReturnType<typeof createClient> | null = null;

export function initializeBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export function getSupabaseClient() {
  if (!cachedClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase client credentials.");
    }

    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export const supabase = null as unknown as ReturnType<typeof createClient>;

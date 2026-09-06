import { createBrowserClient } from "@supabase/ssr";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function initializeBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  if (!cachedClient) {
    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: { flowType: "pkce" },
    });
  }
}

export function getSupabaseClient() {
  if (!cachedClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase client credentials.");
    }

    cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: { flowType: "pkce" },
    });
  }
  return cachedClient;
}

export const supabase = null as unknown as ReturnType<typeof createBrowserClient>;

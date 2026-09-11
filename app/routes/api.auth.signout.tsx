import { json } from "@remix-run/node";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function action({ request, context }: { request: Request; context: Record<string, any> }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
    const supabase = getSupabaseServerClient(env);
    await supabase.auth.signOut();
    return json({ success: true }, { status: 200 });
  } catch {
    return json({ error: "Failed to sign out" }, { status: 500 });
  }
}

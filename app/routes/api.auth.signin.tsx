import { json } from "@remix-run/node";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function action({ request, context }: { request: Request; context: Record<string, any> }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return json({ error: "Email and password are required" }, { status: 400 });
    }

    const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
    const supabase = getSupabaseServerClient(env);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return json({ error: error.message }, { status: 401 });
    }

    return json({ user: data.user }, { status: 200 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

import { json } from "@remix-run/node";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ user: data.user }, { status: 201 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

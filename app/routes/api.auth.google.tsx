import { redirect } from "@remix-run/node";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function action({ request }: { request: Request }) {
  const url = new URL(request.url);
  const appOrigin = url.origin;
  const redirectTo = `${appOrigin}/api/auth/callback`;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    throw new Error(error?.message || "Failed to initiate Google Sign-In");
  }

  return redirect(data.url);
}

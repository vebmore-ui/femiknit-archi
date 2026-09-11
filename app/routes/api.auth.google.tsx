import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function initiateGoogleAuth(request: Request, env?: Record<string, string | undefined>): Promise<Response> {
  const url = new URL(request.url);
  const appOrigin = process.env.APP_URL || url.origin;
  const next = url.searchParams.get("next") || "/";
  const redirectTo = `${appOrigin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const { client: supabase, getHeaders } = createServerSupabaseClient(request, env);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    throw new Error(error?.message || "Failed to initiate Google Sign-In");
  }

  return redirect(data.url, { headers: getHeaders() });
}

export async function loader({ request, context }: { request: Request; context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  return initiateGoogleAuth(request, env);
}

export async function action({ request, context }: { request: Request; context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  return initiateGoogleAuth(request, env);
}

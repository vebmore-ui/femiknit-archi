import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function initiateGoogleAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const appOrigin = process.env.APP_URL || url.origin;
  const next = url.searchParams.get("next") || "/";
  const redirectTo = `${appOrigin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const { client: supabase } = createServerSupabaseClient(request);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    throw new Error(error?.message || "Failed to initiate Google Sign-In");
  }

  return redirect(data.url);
}

export async function loader({ request }: LoaderFunctionArgs) {
  return initiateGoogleAuth(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return initiateGoogleAuth(request);
}

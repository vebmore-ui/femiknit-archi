import { redirect, json, type LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request, context }: { request: Request; context: Record<string, any> }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  const ownerEmail = env?.OWNER_EMAIL || process.env.OWNER_EMAIL;

  if (error) {
    throw redirect(
      `/?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`
    );
  }

  if (!code) {
    throw redirect("/?error=no_code");
  }

  const { client: supabase, getHeaders } =
    await import("@/lib/supabase-server").then((m) =>
      m.createServerSupabaseClient(request, env)
    );
  const { data, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    throw redirect("/?error=exchange_failed");
  }

  const user = data.session.user;
  const headers = getHeaders();

  if (next.startsWith("/admin") && user.email !== ownerEmail) {
    throw redirect("/?error=access_denied", { headers });
  }

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || "";
  try {
    const cookieHeader = request.headers.get("cookie");
    await fetch(new URL("/api/customers", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ email: user.email, name }),
    });
  } catch {
    // ignore customer sync errors
  }

  throw redirect(next, { headers });
};

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-800 rounded-full animate-spin" />
        </div>
        <p className="font-serif text-lg font-semibold text-rose-950">
          Completing sign in...
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Please wait while we verify your identity
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getSupabaseClient, initializeBrowserClient } from "@/lib/supabase";

export const loader = async () => {
  return json({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
};

type LoaderData = {
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
};

export default function AuthCallback() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      initializeBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }, [SUPABASE_URL, SUPABASE_ANON_KEY]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = searchParams.get("code") || url.searchParams.get("code");
        const next = searchParams.get("next") || url.searchParams.get("next") || "/";

        const { data: { session } } = await getSupabaseClient().auth.getSession();
        if (session?.user) {
          setStatus("success");
          setTimeout(() => navigate(next, { replace: true }), 1200);
          return;
        }

        if (!code) {
          setStatus("error");
          setErrorMessage("No authentication code received. Please try signing in again.");
          return;
        }

        const { error } = await getSupabaseClient().auth.exchangeCodeForSession(code);

        if (error) {
          setStatus("error");
          setErrorMessage(error.message || "Authentication failed. Please try again.");
          return;
        }

        const { data: { session: newSession } } = await getSupabaseClient().auth.getSession();
        if (newSession?.user) {
          const name = newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name || "";
          const attempts = [0, 800, 1600];
          for (const delay of attempts) {
            if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
            try {
              const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newSession.user.email, name }),
              });
              if (res.ok) break;
            } catch {
              // retry
            }
          }
        }

        setStatus("success");
        setTimeout(() => navigate(next, { replace: true }), 1200);
      } catch {
        setStatus("error");
        setErrorMessage("Unexpected error during authentication. Please try again.");
      }
    };

    void handleCallback();
  }, [searchParams, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-800 rounded-full animate-spin" />
          </div>
          <p className="font-serif text-lg font-semibold text-rose-950">Completing sign in...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait while we verify your identity</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4 h-10 w-10 rounded-full bg-emerald-100 text-emerald-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-serif text-lg font-semibold text-rose-950">Sign in successful!</p>
          <p className="text-sm text-gray-500 mt-1">Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4 h-10 w-10 rounded-full bg-red-100 text-red-700">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <p className="font-serif text-lg font-semibold text-rose-950">Authentication failed</p>
        <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
        <button
          onClick={() => navigate("/signin")}
          className="mt-4 inline-flex items-center rounded-full bg-rose-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-900"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

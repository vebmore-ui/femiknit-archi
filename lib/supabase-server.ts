import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { serialize } from "cookie";

const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ONE_YEAR_MAX_AGE = 60 * 60 * 24 * 365;

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (name) {
      const rawValue = rest.join("=");
      try {
        acc[name] = decodeURIComponent(rawValue);
      } catch {
        acc[name] = rawValue;
      }
    }
    return acc;
  }, {} as Record<string, string>);
}

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server credentials. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.");
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseClient(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookieOptions: {
        maxAge: ONE_YEAR_MAX_AGE,
      },
      cookies: {
        getAll: () =>
          Object.entries(cookies).map(([name, value]) => ({ name, value })),
        setAll: (cookiesToSet) => {
          responseCookies.push(
            ...cookiesToSet.map(({ name, value, options }) => ({
              name,
              value,
              options: options || {},
            }))
          );
        },
      },
    }
  );
}

export async function requireOwner(request: Request): Promise<{ user: { id: string; email?: string | null }; headers: Headers }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: {
        maxAge: ONE_YEAR_MAX_AGE,
      },
      cookies: {
        getAll: () =>
          Object.entries(cookies).map(([name, value]) => ({ name, value })),
        setAll: (cookiesToSet) => {
          responseCookies.push(
            ...cookiesToSet.map(({ name, value, options }) => ({
              name,
              value,
              options: options || {},
            }))
          );
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail || user.email !== ownerEmail) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  const headers = new Headers();
  responseCookies.forEach(({ name, value, options }) => {
    const cookieStr = serialize(name, value, {
      ...options,
      maxAge: ONE_YEAR_MAX_AGE,
      path: "/",
    });
    headers.append("Set-Cookie", cookieStr);
  });

  return { user, headers };
}

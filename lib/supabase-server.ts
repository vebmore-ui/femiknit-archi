import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { serialize } from "cookie";

const ONE_YEAR_MAX_AGE = 60 * 60 * 24 * 365;

function getSupabaseUrl(env?: Record<string, string | undefined>): string {
  const url = env?.SUPABASE_URL || process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("Missing SUPABASE_URL");
  return url;
}

function getSupabaseAnonKey(env?: Record<string, string | undefined>): string {
  const key = env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing SUPABASE_ANON_KEY");
  return key;
}

function getSupabaseServiceKey(env?: Record<string, string | undefined>): string {
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing Supabase server credentials. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.");
  return key;
}

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

export function getSupabaseServerClient(env?: Record<string, string | undefined>): SupabaseClient {
  const supabaseUrl = getSupabaseUrl(env);
  const supabaseServiceKey = getSupabaseServiceKey(env);
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseClient(request: Request, env?: Record<string, string | undefined>) {
  const supabaseUrl = getSupabaseUrl(env);
  const supabaseAnonKey = getSupabaseAnonKey(env);
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

  return {
    client: supabase,
    getHeaders: () => {
      const headers = new Headers();
      responseCookies.forEach(({ name, value, options }) => {
        headers.append(
          "Set-Cookie",
          serialize(name, value, {
            ...options,
            maxAge: ONE_YEAR_MAX_AGE,
            path: "/",
          })
        );
      });
      return headers;
    },
  };
}

export async function requireOwner(request: Request, env?: Record<string, string | undefined>): Promise<{ user: { id: string; email?: string | null }; headers: Headers }> {
  const supabaseUrl = getSupabaseUrl(env);
  const supabaseAnonKey = getSupabaseAnonKey(env);
  const ownerEmail = env?.OWNER_EMAIL || process.env.OWNER_EMAIL;

  if (!ownerEmail) {
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

  if (user.email !== ownerEmail) {
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

export async function requireAdmin(request: Request, env?: Record<string, string | undefined>): Promise<{ user: { id: string; email?: string | null }; headers: Headers }> {
  const supabaseUrl = getSupabaseUrl(env);
  const supabaseAnonKey = getSupabaseAnonKey(env);
  const serviceRoleKey = getSupabaseServiceKey(env);

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
    throw new Response("Unauthorized", { status: 401, statusText: "Unauthorized" });
  }

  if (!user.email) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const normalizedEmail = user.email.trim().toLowerCase();

  const { data: adminUser, error: adminError } = await adminSupabase
    .from("admin_users")
    .select("email")
    .eq("email", normalizedEmail)
    .eq("role", "admin")
    .maybeSingle();

  console.log(`[requireAdmin diagnostics] SUPABASE_URL configured: ${Boolean(env?.SUPABASE_URL || process.env.SUPABASE_URL)} SUPABASE_ANON_KEY configured: ${Boolean(env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)} SUPABASE_SERVICE_ROLE_KEY configured: ${Boolean(env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)} authenticatedEmail=${user.email} normalizedEmail=${normalizedEmail} adminFound=${!!adminUser} adminError=${adminError ? adminError.message : "none"}`);

  if (adminError || !adminUser) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
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

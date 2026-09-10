import { createServerClient } from "@supabase/ssr";
import { serialize } from "cookie";

const ONE_YEAR_MAX_AGE = 60 * 60 * 24 * 365;

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (name) {
      try {
        acc[name] = decodeURIComponent(rest.join("="));
      } catch {
        acc[name] = rest.join("=");
      }
    }
    return acc;
  }, {} as Record<string, string>);
}

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("Missing SUPABASE_URL");
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing SUPABASE_ANON_KEY");
  return key;
}

function getOwnerEmail(): string {
  const email = process.env.OWNER_EMAIL;
  if (!email) throw new Error("Missing OWNER_EMAIL");
  return email;
}

function buildSetCookieHeaders(
  responseCookies: { name: string; value: string; options: Record<string, unknown> }[]
): Headers {
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
}

export interface AdminAuthResult {
  isAuthenticated: boolean;
  userEmail?: string;
  headers: Headers;
}

export async function checkAdminAuth(request: Request): Promise<AdminAuthResult> {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const ownerEmail = getOwnerEmail();

  const cookies = parseCookies(request.headers.get("cookie"));
  const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  const headers = buildSetCookieHeaders(responseCookies);

  if (!user || error) {
    return { isAuthenticated: false, headers };
  }

  if (user.email !== ownerEmail) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  return { isAuthenticated: true, userEmail: user.email, headers };
}

export async function requireOwner(request: Request): Promise<{
  user: { id: string; email?: string | null };
  headers: Headers;
}> {
  const result = await checkAdminAuth(request);
  if (!result.isAuthenticated) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }
  return {
    user: { id: "", email: result.userEmail },
    headers: result.headers,
  };
}

export async function logoutAdmin(request: Request): Promise<Headers> {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  const cookies = parseCookies(request.headers.get("cookie"));
  const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  await supabase.auth.signOut();

  return buildSetCookieHeaders(responseCookies);
}

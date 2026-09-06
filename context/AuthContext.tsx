import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSupabaseClient, initializeBrowserClient } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/auth-js";

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PENDING_CUSTOMERS_KEY = "pending_customers";

function getPendingCustomers(): { email: string; name?: string }[] {
  try {
    const raw = localStorage.getItem(PENDING_CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingCustomers(customers: { email: string; name?: string }[]) {
  try {
    localStorage.setItem(PENDING_CUSTOMERS_KEY, JSON.stringify(customers));
  } catch {
    // ignore storage errors
  }
}

async function postCustomer(payload: { email: string; name?: string }): Promise<boolean> {
  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return res.ok;
  } catch (err) {
    console.error("Customer sync failed:", err);
    return false;
  }
}

async function syncCustomer(payload: { email: string; name?: string }) {
  const delays = [0, 1000, 2000];

  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
    }
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (res.ok) {
        console.log("Customer synced successfully:", payload.email);
        return;
      }
      console.warn(`Customer sync attempt ${i + 1} failed for ${payload.email}:`, res.status);
    } catch (err) {
      console.warn(`Customer sync attempt ${i + 1} error for ${payload.email}:`, err);
    }
  }

  console.warn("Customer sync failed after retries, queued:", payload.email);
  const pending = getPendingCustomers();
  const exists = pending.some((c) => c.email === payload.email);
  if (!exists) {
    pending.push(payload);
    savePendingCustomers(pending);
  }
}

async function syncPendingCustomers() {
  const pending = getPendingCustomers();
  if (pending.length === 0) return;
  console.log(`Syncing ${pending.length} pending customer(s)...`);
  for (const customer of pending) {
    await syncCustomer(customer);
  }
}

export function AuthProvider({ children, supabaseUrl, supabaseAnonKey }: { children: React.ReactNode; supabaseUrl?: string; supabaseAnonKey?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      initializeBrowserClient(supabaseUrl, supabaseAnonKey);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initAuth = async () => {
      try {
        const { data: { session } } = await getSupabaseClient().auth.getSession();
        if (!mounted) return;

        const trySetUser = (sess: typeof session) => {
          if (!mounted) return;
          if (sess?.user) {
            setUser({
              id: sess.user.id,
              email: sess.user.email || "",
              name: sess.user.user_metadata?.full_name || sess.user.user_metadata?.name,
              avatar_url: sess.user.user_metadata?.avatar_url || sess.user.user_metadata?.picture,
            });
            setLoading(false);
            return true;
          }
          return false;
        };

        if (!trySetUser(session)) {
          while (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            retryCount++;
            const { data } = await getSupabaseClient().auth.refreshSession();
            if (trySetUser(data.session)) break;
          }
        }
      } catch {
        // ignore auth init errors
      } finally {
        if (mounted) {
          setLoading(false);
          void syncPendingCustomers();
        }
      }
    };

    initAuth();

    const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        });
        void syncCustomer({ email: session.user.email || "", name });
        void syncPendingCustomers();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const interval = window.setInterval(() => {
      void syncPendingCustomers();
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.clearInterval(interval);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (!error) {
      await syncCustomer({ email });
    }
    return { error: error?.message };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (!error) {
      await syncCustomer({ email, name });
    }
    return { error: error?.message };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await getSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

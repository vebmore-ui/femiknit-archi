import { json } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";

export async function loader({ context }: { context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  const supabaseUrl = env?.SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  if (!supabase) {
    return json([]);
  }
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("join_date", { ascending: false });

    if (error) {
      console.error("Failed to load customers from Supabase:", error);
      return json([]);
    }

    return json(data || []);
  } catch {
    return json([]);
  }
}

export async function action({ request, context }: { request: Request; context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  const supabaseUrl = env?.SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();

    const customer = {
      id: body.id || body.email,
      name: body.name || body.email?.split("@")[0] || "User",
      email: body.email,
      phone: body.phone || "",
      address: body.address || "",
      total_orders: body.totalOrders ?? 0,
      total_spent: body.totalSpent || "₹0",
      spent_raw: body.spentRaw ?? 0,
      join_date: body.joinDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tier: body.tier || "Standard",
      recent_orders: body.recentOrders || [],
    };

    if (supabase) {
      const { error } = await supabase
        .from("customers")
        .upsert(customer, { onConflict: "email" });

      if (error) {
        console.error("Supabase customer sync error:", error);
      } else {
        console.log("Synced customer to Supabase:", customer.email);
      }
    } else {
      console.warn("Supabase not configured, skipping customer sync");
    }

    return json(customer, { status: 201 });
  } catch (err) {
    console.error("Failed to save customer:", err);
    return json({ error: "Invalid request", details: String(err) }, { status: 400 });
  }
}

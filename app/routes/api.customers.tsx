import { json } from "@remix-run/node";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const dataFile = path.join(process.cwd(), "lib", "customers.json");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function readCustomers() {
  try {
    if (!existsSync(dataFile)) {
      writeFileSync(dataFile, JSON.stringify([], null, 2));
      return [];
    }
    const data = readFileSync(dataFile, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeCustomers(customers: unknown[]) {
  writeFileSync(dataFile, JSON.stringify(customers, null, 2));
}

async function syncToSupabase(customer: Record<string, unknown>) {
  if (!supabase) {
    console.warn("Supabase client not configured, skipping remote sync");
    return;
  }
  try {
    const { error } = await supabase.from("customers").upsert({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
      total_orders: customer.totalOrders ?? 0,
      total_spent: customer.totalSpent || "₹0",
      spent_raw: customer.spentRaw ?? 0,
      join_date: customer.joinDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tier: customer.tier || "Standard",
      recent_orders: customer.recentOrders || [],
    }, { onConflict: "email" });
    if (error) {
      console.error("Supabase sync error:", error);
    } else {
      console.log("Synced to Supabase:", customer.email);
    }
  } catch (err) {
    console.error("Supabase sync exception:", err);
  }
}

export async function loader() {
  const customers = readCustomers();
  return json(customers);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();
    const customers = readCustomers();
    const existing = customers.find((c: Record<string, unknown>) => c.email === body.email);
    if (existing) {
      void syncToSupabase(existing);
      return json(existing, { status: 200 });
    }
    const newCustomer = {
      id: body.id || body.email,
      name: body.name || body.email?.split("@")[0] || "User",
      email: body.email,
      phone: body.phone || "",
      address: body.address || "",
      totalOrders: 0,
      totalSpent: "₹0",
      spentRaw: 0,
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tier: "Standard",
      recentOrders: []
    };
    customers.push(newCustomer);
    writeCustomers(customers);
    console.log("Customer saved locally:", newCustomer.email);
    void syncToSupabase(newCustomer);
    return json(newCustomer, { status: 201 });
  } catch (err) {
    console.error("Failed to save customer:", err);
    return json({ error: "Invalid request", details: String(err) }, { status: 400 });
  }
}

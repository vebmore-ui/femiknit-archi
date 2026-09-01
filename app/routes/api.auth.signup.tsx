import { json } from "@remix-run/node";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "lib", "customers.json");

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

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    const customers = readCustomers();
    const existing = customers.find((c: Record<string, unknown>) => c.email === email);
    if (!existing) {
      const newCustomer = {
        id: `CUST-${String(customers.length + 1).padStart(3, "0")}`,
        name,
        email,
        phone: "",
        address: "",
        totalOrders: 0,
        totalSpent: "₹0",
        spentRaw: 0,
        joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        tier: "Standard",
        recentOrders: []
      };
      customers.push(newCustomer);
      writeCustomers(customers);
    }

    return json({ user: data.user }, { status: 201 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

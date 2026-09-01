import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { json } from "@remix-run/node";

const dataFile = path.join(process.cwd(), "lib", "orders.json");

function readOrders() {
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

export async function loader() {
  const orders = readOrders();
  return json(orders);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();
    const orders = readOrders();
    const newOrder = {
      id: body.id || `ORD-${String(orders.length + 1).padStart(4, "0")}`,
      customer: body.customer,
      email: body.email,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      total: body.total || "₹0",
      status: body.status || "New",
      trackingNumber: "",
      items: body.items || []
    };
    orders.unshift(newOrder);
    writeFileSync(dataFile, JSON.stringify(orders, null, 2));
    return json(newOrder, { status: 201 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

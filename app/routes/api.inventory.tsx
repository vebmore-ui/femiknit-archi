import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { json } from "@remix-run/node";

const dataFile = path.join(process.cwd(), "lib", "inventory.json");

function readInventory() {
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
  const inventory = readInventory();
  return json(inventory);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();
    const inventory = readInventory();
    const newItem = {
      id: body.id || `INV-${String(inventory.length + 1).padStart(3, "0")}`,
      product: body.product,
      sku: body.sku,
      size: body.size,
      color: body.color,
      stock: body.stock || 0,
      status: body.status || "In Stock"
    };
    inventory.push(newItem);
    writeFileSync(dataFile, JSON.stringify(inventory, null, 2));
    return json(newItem, { status: 201 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

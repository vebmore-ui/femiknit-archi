import { json } from "@remix-run/node";
import { getAllProducts, createProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase-server";

export async function loader({ context }: { context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  const products = await getAllProducts(env);
  return json(products);
}

export async function action({ request, context }: { request: Request; context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    await requireAdmin(request, env);
  } catch (err) {
    if (err instanceof Response) {
      return json({ error: "Admin access required" }, { status: err.status });
    }
    return json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log("API received product creation request:", JSON.stringify(body, null, 2));
    const product = await createProduct(body, env);
    console.log("API product creation success:", product.id);
    return json(product, { status: 201 });
  } catch (err) {
    console.error("API create product error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Returning error to client:", errorMessage);
    return json({ error: errorMessage }, { status: 400 });
  }
}

import { json } from "@remix-run/node";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase-server";

export async function loader({ params, context }: { params: { id: string }; context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;
  const product = await getProductById(params.id, env);
  if (!product) {
    return json({ error: "Product not found" }, { status: 404 });
  }
  return json(product);
}

export async function action({ params, request, context }: { params: { id: string }; request: Request; context: Record<string, any> }) {
  const env = context?.cloudflare?.env as Record<string, string | undefined> | undefined;

  try {
    await requireAdmin(request, env);
  } catch (err) {
    if (err instanceof Response) {
      return json({ error: "Admin access required" }, { status: err.status });
    }
    return json({ error: "Admin access required" }, { status: 403 });
  }

  if (request.method === "PUT") {
    try {
      const body = await request.json();
      const product = await updateProduct(params.id, body, env);
      if (!product) {
        return json({ error: "Product not found" }, { status: 404 });
      }
      return json(product);
    } catch (err) {
      console.error("Update product error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return json({ error: `Failed to update product: ${errorMessage}` }, { status: 400 });
    }
  }

  if (request.method === "DELETE") {
    try {
      const deleted = await deleteProduct(params.id, env);
      if (!deleted) {
        return json({ error: "Product not found" }, { status: 404 });
      }
      return json({ success: true });
    } catch (err) {
      console.error("Delete product error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return json({ error: `Failed to delete product: ${errorMessage}` }, { status: 400 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}

import { json } from "@remix-run/node";
import { getAllProducts, createProduct } from "@/lib/db";

export async function loader() {
  const products = await getAllProducts();
  return json(products);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();
    console.log("API received product creation request:", JSON.stringify(body, null, 2));
    const product = await createProduct(body);
    console.log("API product creation success:", product.id);
    return json(product, { status: 201 });
  } catch (err) {
    console.error("API create product error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Returning error to client:", errorMessage);
    return json({ error: errorMessage }, { status: 400 });
  }
}

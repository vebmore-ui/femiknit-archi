import { json } from "@remix-run/node";

export async function loader() {
  return json([]);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  return json({ error: "Orders are currently handled via WhatsApp. This endpoint is disabled during Cloudflare migration." }, { status: 501 });
}

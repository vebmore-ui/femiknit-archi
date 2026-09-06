import { json } from "@remix-run/node";

export async function loader() {
  return json([]);
}

export async function action({ request }: { request: Request }) {
  if (request.method === "POST") {
    return json({ error: "Banner management is temporarily unavailable during Cloudflare migration." }, { status: 501 });
  }

  if (request.method === "DELETE") {
    return json({ error: "Banner management is temporarily unavailable during Cloudflare migration." }, { status: 501 });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}

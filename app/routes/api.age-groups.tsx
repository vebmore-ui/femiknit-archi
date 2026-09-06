import { json } from "@remix-run/node";
import { ageGroups } from "@/lib/constants";

export async function loader() {
  return json(ageGroups);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  return json({ error: "Age group management is temporarily unavailable during Cloudflare migration." }, { status: 501 });
}

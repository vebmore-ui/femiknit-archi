import { json } from "@remix-run/node";
import { heroSlides } from "@/lib/constants";

export async function loader() {
  return json(heroSlides);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  return json({ error: "Hero slide management is temporarily unavailable during Cloudflare migration." }, { status: 501 });
}

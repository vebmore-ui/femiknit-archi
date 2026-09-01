import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { json } from "@remix-run/node";

const dataFile = path.join(process.cwd(), "lib", "banners.json");

function readBanners() {
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

function writeBanners(banners: unknown[]) {
  writeFileSync(dataFile, JSON.stringify(banners, null, 2));
}

export async function loader() {
  const banners = readBanners();
  return json(banners);
}

export async function action({ request }: { request: Request }) {
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const banners = readBanners();
      const newBanner = {
        id: body.id || `BAN-${Date.now().toString().slice(-4)}`,
        title: body.title,
        subtitle: body.subtitle || "",
        badge: body.badge || "",
        cta: body.cta || "",
        status: body.status || "Active",
        image: body.image || "default-banner.jpg",
        link: body.link || "/",
      };
      banners.unshift(newBanner);
      writeBanners(banners);
      return json(newBanner, { status: 201 });
    } catch {
      return json({ error: "Invalid request" }, { status: 400 });
    }
  }
  
  if (request.method === "DELETE") {
    try {
      const body = await request.json();
      const banners = readBanners();
      const filtered = banners.filter((b: { id: string }) => b.id !== body.id);
      writeBanners(filtered);
      return json({ success: true });
    } catch {
      return json({ error: "Invalid request" }, { status: 400 });
    }
  }
  
  return json({ error: "Method not allowed" }, { status: 405 });
}

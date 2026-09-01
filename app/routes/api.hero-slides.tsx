import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { json } from "@remix-run/node";

const dataFile = path.join(process.cwd(), "lib", "hero-slides.json");

function readSlides() {
  try {
    if (!existsSync(dataFile)) {
      const { heroSlides } = require("@/lib/constants");
      writeFileSync(dataFile, JSON.stringify(heroSlides, null, 2));
      return heroSlides;
    }
    const data = readFileSync(dataFile, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const { heroSlides } = require("@/lib/constants");
      writeFileSync(dataFile, JSON.stringify(heroSlides, null, 2));
      return heroSlides;
    }
    return parsed;
  } catch {
    const { heroSlides } = require("@/lib/data");
    return heroSlides;
  }
}

export async function loader() {
  const slides = readSlides();
  return json(slides);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();
    const slides = readSlides();
    slides.unshift(body);
    writeFileSync(dataFile, JSON.stringify(slides, null, 2));
    return json(body, { status: 201 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

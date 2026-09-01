import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { json } from "@remix-run/node";

const dataFile = path.join(process.cwd(), "lib", "age-groups.json");

function readGroups() {
  try {
    if (!existsSync(dataFile)) {
      const { ageGroups } = require("@/lib/constants");
      writeFileSync(dataFile, JSON.stringify(ageGroups, null, 2));
      return ageGroups;
    }
    const data = readFileSync(dataFile, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const { ageGroups } = require("@/lib/constants");
      writeFileSync(dataFile, JSON.stringify(ageGroups, null, 2));
      return ageGroups;
    }
    return parsed;
  } catch {
      const { ageGroups } = require("@/lib/constants");
    return ageGroups;
  }
}

export async function loader() {
  const groups = readGroups();
  return json(groups);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const body = await request.json();
    const groups = readGroups();
    groups.unshift(body);
    writeFileSync(dataFile, JSON.stringify(groups, null, 2));
    return json(body, { status: 201 });
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }
}

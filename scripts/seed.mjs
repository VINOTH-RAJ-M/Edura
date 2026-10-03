// Usage: npm run seed   |   npm run seed:reset
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { seed } from "./seed-lib.mjs";

// minimal .env.local loader (no extra dependency)
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(1); }

const db = createClient(url, key, { auth: { persistSession: false } });
seed(db, { reset: process.argv.includes("--reset") }).catch((e) => { console.error("Seed failed:", e.message); process.exit(1); });

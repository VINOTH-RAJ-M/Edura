import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

/** Service-role client. Server only. Bypasses RLS. */
export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

export type AuthedUser = { id: string; role: "student" | "staff" | "admin"; name: string | null };

/** Verifies the bearer token and returns the user's profile, or null. */
export async function getUser(req: NextRequest): Promise<AuthedUser | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const db = admin();
  const { data } = await db.auth.getUser(token);
  if (!data.user) return null;
  const { data: p } = await db.from("profiles").select("id, role, full_name").eq("id", data.user.id).single();
  return p ? { id: p.id, role: p.role, name: p.full_name } : null;
}

export const isStaff = (u: AuthedUser | null) => !!u && (u.role === "staff" || u.role === "admin");

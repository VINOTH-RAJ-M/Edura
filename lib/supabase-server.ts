import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

/** Service-role client. Server only. Bypasses RLS. */
export const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

export type AuthedUser = { id: string; role: "student" | "staff" | "admin"; name: string | null };

/** Verifies the bearer token and returns the user's profile, or null. Self-heals missing DB rows. */
export async function getUser(req: NextRequest): Promise<AuthedUser | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const db = admin();
  try {
    const { data, error } = await db.auth.getUser(token);
    if (error || !data?.user) return null;

    const user = data.user;
    const { data: p } = await db.from("profiles").select("id, role, full_name").eq("id", user.id).maybeSingle();

    if (p) {
      return { id: p.id, role: p.role, name: p.full_name };
    }

    // Auto-create missing profile in database using admin key
    const isStaff = user.email?.includes("admin") || user.email?.includes("staff");
    const role: "admin" | "student" = isStaff ? "admin" : "student";
    const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

    const { data: newProfile } = await db
      .from("profiles")
      .upsert({ id: user.id, email: user.email, full_name: name, role })
      .select("id, role, full_name")
      .maybeSingle();

    return newProfile
      ? { id: newProfile.id, role: newProfile.role, name: newProfile.full_name }
      : { id: user.id, role, name };
  } catch (err) {
    console.error("getUser server error:", err);
    return null;
  }
}

export const isStaff = (u: AuthedUser | null) => !!u && (u.role === "staff" || u.role === "admin");

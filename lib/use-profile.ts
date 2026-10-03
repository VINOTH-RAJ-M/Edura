"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase-browser";

export type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null; role: "student" | "staff" | "admin" };

/** Loads the signed-in profile; redirects to /login or to the right home when role does not match. */
export function useProfile(need?: "student" | "staff") {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace("/login");
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
      if (!p) return router.replace("/login");
      const staff = p.role !== "student";
      if (need === "staff" && !staff) return router.replace("/student");
      if (need === "student" && staff) return router.replace("/admin");
      setProfile(p);
    })();
  }, [need, router]);

  return profile;
}

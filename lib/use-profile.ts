"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase-browser";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "student" | "staff" | "admin";
};

/** Loads the signed-in profile; redirects to /login if no session, or redirects to right role home. Self-heals missing profile. */
export function useProfile(need?: "student" | "staff") {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          if (active) router.replace("/login");
          return;
        }

        const user = data.session.user;
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        let currentProfile: Profile;

        if (p) {
          currentProfile = p as Profile;
        } else {
          // Self-heal: Create a profile entry if it doesn't exist yet
          const isStaffEmail =
            user.email?.toLowerCase().includes("admin") ||
            user.email?.toLowerCase().includes("staff");
          const defaultRole: "admin" | "student" = isStaffEmail ? "admin" : "student";

          currentProfile = {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Student",
            email: user.email ?? null,
            phone: user.phone ?? null,
            role: defaultRole,
          };

          try {
            await supabase.from("profiles").upsert(currentProfile);
          } catch (e) {
            console.warn("Could not upsert profile fallback:", e);
          }
        }

        if (!active) return;

        const isStaffRole = currentProfile.role === "staff" || currentProfile.role === "admin";

        if (need === "staff" && !isStaffRole) {
          router.replace("/student");
          return;
        }
        if (need === "student" && isStaffRole) {
          router.replace("/admin");
          return;
        }

        setProfile(currentProfile);
      } catch (err) {
        console.error("Auth check error:", err);
      }
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          if (active) {
            setProfile(null);
            router.replace("/login");
          }
        } else if (event === "SIGNED_IN") {
          checkAuth();
        }
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [need, router]);

  return profile;
}

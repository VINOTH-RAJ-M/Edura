"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.replace("/login");
      const { data: p } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).maybeSingle();
      const isStaff = p?.role === "staff" || p?.role === "admin" || data.session.user.email?.includes("admin");
      router.replace(isStaff ? "/admin" : "/student");
    })();
  }, [router]);
  return <p className="p-8 text-sm">Loading…</p>;
}

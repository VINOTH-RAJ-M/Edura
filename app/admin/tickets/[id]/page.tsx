"use client";
import { use } from "react";
import Shell from "@/components/Shell";
import TicketDetail from "@/components/TicketDetail";
import { useProfile } from "@/lib/use-profile";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profile = useProfile("staff");
  if (!profile) return <p className="p-8 text-sm">Loading…</p>;
  return (
    <Shell profile={profile} kind="staff">
      <TicketDetail id={id} staff={true} />
    </Shell>
  );
}

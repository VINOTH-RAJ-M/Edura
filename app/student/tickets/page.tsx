"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import TicketList from "@/components/TicketList";
import { authHeaders } from "@/lib/supabase-browser";
import { useProfile } from "@/lib/use-profile";

export default function MyTickets() {
  const profile = useProfile("student");
  const [tickets, setTickets] = useState<any[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const r = await fetch("/api/tickets", { headers: await authHeaders() });
      const j = await r.json();
      setTickets(j.tickets ?? []);
    })();
  }, [profile]);

  if (!profile) return <p className="p-8 text-sm">Loading…</p>;

  const filteredTickets = (tickets ?? []).filter((t) => {
    if (statusFilter === "open") return !["Resolved", "Closed"].includes(t.status);
    if (statusFilter === "closed") return ["Resolved", "Closed"].includes(t.status);
    return true;
  });

  return (
    <Shell profile={profile} kind="student">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My Support Tickets</h1>
          <p className="text-sm text-ink/60 mt-0.5">
            View history, track active inquiries, and review AI recommendations
          </p>
        </div>
        <Link href="/student/tickets/new" className="btn shadow-sm">
          <span>+ Raise a Ticket</span>
        </Link>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex gap-2 mt-5">
        {[
          { id: "all", label: "All Tickets" },
          { id: "open", label: "Active / In Progress" },
          { id: "closed", label: "Resolved / Closed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === tab.id
                ? "bg-teal text-white shadow-xs"
                : "bg-white border border-ink/10 text-ink/70 hover:bg-ink/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tickets ? (
        <TicketList tickets={filteredTickets} base="/student/tickets" />
      ) : (
        <div className="p-12 text-center text-sm text-ink/60">
          <span className="animate-spin inline-block mr-2">🌀</span> Loading your tickets…
        </div>
      )}
    </Shell>
  );
}

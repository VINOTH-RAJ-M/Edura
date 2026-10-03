"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import TicketList from "@/components/TicketList";
import { authHeaders } from "@/lib/supabase-browser";
import { useProfile } from "@/lib/use-profile";
import { CATEGORIES, STATUSES } from "@/lib/types";

export default function AdminTickets() {
  const profile = useProfile("staff");
  const [f, setF] = useState({ status: "", priority: "", category: "", search: "" });
  const [tickets, setTickets] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    if (!profile) return;
    setLoading(true);
    const params: Record<string, string> = {};
    if (f.status) params.status = f.status;
    if (f.priority) params.priority = f.priority;
    if (f.category) params.category = f.category;

    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`/api/tickets?${qs}`, { headers: await authHeaders() });
    const j = await r.json();
    setTickets(j.tickets ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [profile, f.status, f.priority, f.category]);

  if (!profile) return <p className="p-8 text-sm">Loading…</p>;

  // Filter client-side by search term (ticket no, student name, email, subject)
  const displayedTickets = (tickets ?? []).filter((t) => {
    if (!f.search.trim()) return true;
    const term = f.search.toLowerCase();
    const ticketNo = (t.ticket_no || "").toLowerCase();
    const studentName = (t.profiles?.full_name || "").toLowerCase();
    const studentEmail = (t.profiles?.email || "").toLowerCase();
    const subject = (t.subject || "").toLowerCase();
    return (
      ticketNo.includes(term) ||
      studentName.includes(term) ||
      studentEmail.includes(term) ||
      subject.includes(term)
    );
  });

  const escalatedCount = displayedTickets.filter((t) => t.escalated).length;
  const highCount = displayedTickets.filter((t) => t.priority === "High").length;

  return (
    <Shell profile={profile} kind="staff">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Support Queue & Tickets</h1>
          <p className="text-sm text-ink/60 mt-0.5">
            Monitor, assign, resolve, and reply to all student support complaints
          </p>
        </div>
        <div className="flex items-center gap-2">
          {escalatedCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-alert-soft text-alert border border-alert/20 animate-pulse">
              🔥 {escalatedCount} Escalated
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-soft text-amber border border-amber/20">
              ⚡ {highCount} High Priority
            </span>
          )}
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-white p-3.5 rounded-xl border border-ink/10 shadow-sm">
        <input
          className="input text-xs py-2"
          placeholder="Search by student, ID or keyword…"
          value={f.search}
          onChange={(e) => setF({ ...f, search: e.target.value })}
        />

        <select
          aria-label="Filter status"
          className="input text-xs py-2"
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter priority"
          className="input text-xs py-2"
          value={f.priority}
          onChange={(e) => setF({ ...f, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          {["High", "Medium", "Low"].map((o) => (
            <option key={o} value={o}>
              {o} Priority
            </option>
          ))}
        </select>

        <select
          aria-label="Filter category"
          className="input text-xs py-2"
          value={f.category}
          onChange={(e) => setF({ ...f, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* Ticket List Table */}
      {tickets ? (
        <TicketList tickets={displayedTickets} base="/admin/tickets" showStudent />
      ) : (
        <div className="p-12 text-center text-sm text-ink/60">
          <span className="animate-spin inline-block mr-2">🌀</span> Loading support queue…
        </div>
      )}
    </Shell>
  );
}

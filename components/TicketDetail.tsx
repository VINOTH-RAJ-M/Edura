"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, fmt } from "./Badges";
import { authHeaders } from "@/lib/supabase-browser";
import { STATUSES } from "@/lib/types";

const sentimentIcons: Record<string, string> = {
  Positive: "😊",
  Neutral: "😐",
  Frustrated: "😟",
  Angry: "😡",
};

export default function TicketDetail({ id, staff }: { id: string; staff: boolean }) {
  const [data, setData] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/tickets/${id}`, { headers: await authHeaders() });
    const j = await r.json();
    if (!r.ok) return setErr(j.error ?? "Could not load the ticket.");
    setData(j);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: object) {
    setBusy(true);
    try {
      await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify(body),
      });
      setReply("");
      setNote("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (err) {
    return (
      <div className="p-8 text-center panel max-w-xl mx-auto space-y-3">
        <div className="text-3xl">⚠️</div>
        <h2 className="text-lg font-bold text-alert">{err}</h2>
        <Link href={staff ? "/admin/tickets" : "/student/tickets"} className="btn text-xs inline-block">
          Return to tickets list
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-sm text-ink/60 flex items-center justify-center gap-2">
        <span className="animate-spin text-teal">🌀</span>
        <span>Loading ticket details…</span>
      </div>
    );
  }

  const { ticket: t, events } = data;
  const finished = ["Resolved", "Closed"].includes(t.status);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink/10">
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <Link href={staff ? "/admin/tickets" : "/student/tickets"} className="hover:text-teal hover:underline">
            {staff ? "Support Queue" : "My Tickets"}
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-ink">{t.ticket_no}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{t.priority}</Badge>
          <Badge>{t.status}</Badge>
          {t.escalated && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-alert-soft text-alert border border-alert/20 flex items-center gap-1 animate-pulse">
              <span>🔥</span>
              <span>SLA Escalated</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-6 items-start">
        {/* Left Main Column */}
        <div className="space-y-5">
          {/* Ticket Header Card */}
          <div className="panel p-6 bg-white space-y-3 border-teal/20 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-ink tracking-tight">
                  {t.subject || "Support Inquiry"}
                </h1>
                <div className="text-xs text-ink/50 mt-1 flex items-center gap-3">
                  <span>Created {fmt(t.created_at)}</span>
                  <span>•</span>
                  <span>Category: <b>{t.category}</b></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-ink/10 text-sm text-ink/90 leading-relaxed whitespace-pre-wrap bg-paper/60 p-4 rounded-lg">
              <div className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-1.5 flex items-center gap-1.5">
                <span>💬</span>
                <span>Student Message</span>
              </div>
              {t.message}
            </div>
          </div>

          {/* AI Automated Reply Sent to Student */}
          {t.ai_reply && (
            <section className="panel p-5 bg-gradient-to-br from-teal-soft/30 via-white to-white border-teal/30 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-teal-dark flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Instant AI Resolution / Reply</span>
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-soft text-teal-dark font-medium font-mono">
                  Gemini AI
                </span>
              </div>
              <p className="text-sm text-ink/85 leading-relaxed bg-white/90 p-4 rounded-lg border border-teal/15 shadow-2xs">
                {t.ai_reply}
              </p>
            </section>
          )}

          {/* Task 3: What happens next (for students) */}
          {!staff && t.suggested_action && (
            <section className="panel p-5 bg-gradient-to-r from-amber-soft/40 via-white to-white border-amber/30 shadow-sm space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber font-semibold flex items-center gap-1.5">
                <span>🧭</span>
                <span>What happens next</span>
              </h2>
              <div className="text-sm text-ink/90 leading-relaxed bg-white/90 p-4 rounded-lg border border-amber/20 shadow-2xs">
                {t.suggested_action}
              </div>
            </section>
          )}

          {/* Activity / Event Timeline */}
          <section className="panel p-6 bg-white shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink/70 flex items-center gap-2">
              <span>📋</span>
              <span>Status History & Events</span>
            </h2>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink/10">
              {events.map((e: any, idx: number) => (
                <div key={e.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-teal border-2 border-white shadow-xs" />
                  <div className="text-xs text-ink/50 font-mono mb-0.5">
                    {fmt(e.created_at)} • <span className="font-semibold text-ink/70 capitalize">{e.event_type}</span>
                  </div>
                  <div className="text-sm text-ink/85 bg-paper/50 p-3 rounded-lg border border-ink/5">
                    {e.note}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Student Action: Add More Details / Close & Rate */}
          {!staff && !finished && (
            <section className="panel p-5 bg-white shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
                <span>✍️</span>
                <span>Add more details or reply</span>
              </h2>
              <textarea
                className="input h-28"
                placeholder="Type any additional context, transaction details, or updates…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                className="btn"
                disabled={busy || !note.trim()}
                onClick={() => patch({ note })}
              >
                {busy ? "Submitting…" : "Send Update"}
              </button>
            </section>
          )}

          {!staff && t.status === "Resolved" && (
            <section className="panel p-5 bg-ok-soft/30 border-ok/30 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <h2 className="text-base font-bold text-ok">Rate your resolution</h2>
                  <p className="text-xs text-ink/60">Help us maintain quality support by confirming your issue is solved.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-ink/80">Satisfaction Rating:</label>
                <select
                  className="input w-36 py-1.5"
                  value={rating}
                  onChange={(e) => setRating(+e.target.value)}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)} ({n}/5)
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="input h-20 text-xs"
                placeholder="Optional feedback comment on how we solved your issue…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                className="btn-ok"
                disabled={busy}
                onClick={() => patch({ rating, feedback: feedback.trim() || undefined })}
              >
                {busy ? "Closing ticket…" : "Confirm & Close Ticket"}
              </button>
            </section>
          )}

          {/* Staff Action: Reply to Student */}
          {staff && (
            <section className="panel p-5 bg-white shadow-sm space-y-3 border-teal/20">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <span>✉️</span>
                  <span>Official Staff Reply</span>
                </h2>
                {t.ai_reply && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-teal hover:underline flex items-center gap-1"
                    onClick={() => setReply(t.ai_reply ?? "")}
                  >
                    <span>⚡ Use AI Suggestion</span>
                  </button>
                )}
              </div>
              <textarea
                className="input h-28"
                placeholder="Write your official response to the student…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="btn"
                  disabled={busy || !reply.trim()}
                  onClick={() => patch({ reply })}
                >
                  {busy ? "Sending…" : "Send Staff Reply"}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right Metadata Aside */}
        <aside className="panel p-5 bg-white shadow-sm space-y-5 sticky top-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-2">
              Ticket Metadata
            </div>
            <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
              <dt className="text-ink/50">Ticket ID</dt>
              <dd className="font-mono font-bold text-ink">{t.ticket_no}</dd>

              <dt className="text-ink/50">Department</dt>
              <dd className="font-semibold text-ink">{t.departments?.name || "General"}</dd>

              <dt className="text-ink/50">Sentiment</dt>
              <dd className="font-semibold text-ink flex items-center gap-1">
                <span>{sentimentIcons[t.sentiment] ?? "💬"}</span>
                <span>{t.sentiment || "Neutral"}</span>
              </dd>

              <dt className="text-ink/50">Language</dt>
              <dd className="font-medium text-ink">{t.language || "English"}</dd>

              <dt className="text-ink/50">Created</dt>
              <dd className="text-ink/75">{fmt(t.created_at)}</dd>

              <dt className="text-ink/50">SLA Due</dt>
              <dd className="font-semibold text-ink/90">{fmt(t.sla_due_at)}</dd>

              {t.rating && (
                <>
                  <dt className="text-ink/50">Student Rating</dt>
                  <dd className="font-bold text-amber">{"★".repeat(t.rating)} ({t.rating}/5)</dd>
                </>
              )}
            </dl>
          </div>

          {staff && (
            <div className="pt-4 border-t border-ink/10 space-y-4">
              {/* Student info */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">
                  Student Profile
                </div>
                <div className="text-xs font-semibold text-ink">{t.profiles?.full_name || "Unknown"}</div>
                <div className="text-[11px] text-ink/50">{t.profiles?.email}</div>
              </div>

              {/* Staff Suggested Action */}
              {t.suggested_action && (
                <div className="p-3 bg-paper rounded-lg border border-ink/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink/50 mb-1">
                    AI Suggested Action
                  </div>
                  <div className="text-xs text-ink/80 leading-relaxed">
                    {t.suggested_action}
                  </div>
                </div>
              )}

              {t.duplicate_of && (
                <div className="p-2.5 bg-amber-soft rounded-lg text-xs text-amber font-medium border border-amber/20">
                  ⚠️ Possible duplicate of an earlier open ticket.
                </div>
              )}

              {/* Status Updater */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-1.5">
                  Update Ticket Status
                </label>
                <select
                  className="input py-2 text-xs font-semibold"
                  value={t.status}
                  onChange={(e) => patch({ status: e.target.value })}
                  disabled={busy}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

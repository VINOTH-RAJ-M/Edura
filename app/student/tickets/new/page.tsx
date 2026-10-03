"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import { Badge } from "@/components/Badges";
import { authHeaders } from "@/lib/supabase-browser";
import { useProfile } from "@/lib/use-profile";
import { CATEGORIES } from "@/lib/types";
import VoiceInput from "@/components/VoiceInput";

function TicketForm({ profile }: { profile: any }) {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    const companyParam = searchParams.get("company");
    const msgParam = searchParams.get("message");
    const subjParam = searchParams.get("subject");

    if (subjParam) setSubject(subjParam);

    if (msgParam) {
      setMessage(msgParam);
    } else if (roleParam) {
      const compText = companyParam ? ` at ${companyParam}` : "";
      setSubject(`Application: ${roleParam}${compText}`);
      setMessage(
        `I would like to apply for the ${roleParam}${compText} internship opportunity. Please review my student profile and guide me through the next interview or submission steps.`
      );
    }
  }, [searchParams]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5) {
      return setErr("Please describe your issue in at least 5 characters.");
    }
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ subject: subject || undefined, message }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErr(j.error ?? "Could not create the ticket.");
      } else {
        setResult(j);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Network error creating ticket.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-ink/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🎫</span>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Raise a Support Ticket</h1>
        </div>
        <p className="text-sm text-ink/60">
          Describe what you need help with. Write freely in English, Tamil, or both. Our Gemini AI engine classifies and routes it instantly.
        </p>
      </div>

      {!result ? (
        <form onSubmit={submit} className="panel p-6 bg-white shadow-sm space-y-5 border-teal/20">
          {/* Quick topic inspiration pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/50 mb-2">
              Common Issue Types (Click to set topic)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    if (!subject) setSubject(`${cat} inquiry`);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-paper hover:bg-teal-soft border border-ink/10 hover:border-teal/30 text-ink/75 hover:text-teal-dark transition-colors"
                >
                  + {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5">
              Subject Line <span className="text-ink/40 font-normal">(Optional — AI will auto-summarize)</span>
            </label>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Course enrollment not appearing after payment"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                Detailed Description <span className="text-alert">*</span>
              </label>
              <div className="flex items-center gap-3">
                <VoiceInput
                  onTranscript={(transcript) =>
                    setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
                  }
                />
                <span className="text-[11px] text-ink/40">{message.length} chars</span>
              </div>
            </div>
            <textarea
              className="input h-36 leading-relaxed"
              required
              minLength={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain the problem or request clearly, or click Voice Input to speak in English or Tamil..."
            />
          </div>

          {err && (
            <div className="p-3.5 rounded-lg bg-alert-soft text-alert text-sm border border-alert/20 flex items-center gap-2">
              <span>⚠️</span>
              <span>{err}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-ink/50 flex items-center gap-1.5">
              <span>🤖</span>
              <span>Instant AI reply & SLA assignment on submission</span>
            </div>
            <button className="btn px-6 py-2.5 shadow-md shadow-teal/10" disabled={busy}>
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin">🌀</span>
                  <span>AI is classifying & routing…</span>
                </span>
              ) : (
                "Submit Support Ticket →"
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Success State */
        <section className="panel p-6 md:p-8 bg-gradient-to-br from-white via-white to-teal-soft/20 border-teal shadow-md space-y-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-ok-soft text-ok flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">Ticket {result.ticket.ticket_no} Created!</h2>
              <p className="text-xs text-ink/60">Your issue has been categorized and routed to the responsible department.</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-ink/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-ink/50 block font-semibold">Category</span>
              <span className="font-bold text-ink">{result.ticket.category}</span>
            </div>
            <div>
              <span className="text-ink/50 block font-semibold">Priority</span>
              <Badge>{result.ticket.priority}</Badge>
            </div>
            <div>
              <span className="text-ink/50 block font-semibold">Department</span>
              <span className="font-semibold text-teal">{result.department}</span>
            </div>
            <div>
              <span className="text-ink/50 block font-semibold">Initial Status</span>
              <Badge>{result.ticket.status}</Badge>
            </div>
          </div>

          {result.ticket.ai_reply && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-dark flex items-center gap-1.5">
                <span>⚡ Instant AI Response</span>
              </div>
              <p className="text-sm text-ink/85 leading-relaxed bg-paper/80 rounded-xl p-4 border border-teal/20">
                {result.ticket.ai_reply}
              </p>
            </div>
          )}

          {result.duplicate && (
            <div className="p-3 bg-amber-soft rounded-lg text-xs text-amber font-medium border border-amber/20">
              ⚠️ Note: An existing open ticket matches this inquiry. Our team will merge and link the history.
            </div>
          )}

          <div className="pt-2 flex gap-3 flex-wrap">
            <Link className="btn" href={`/student/tickets/${result.ticket.id}`}>
              Track this Ticket Live →
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setResult(null);
                setMessage("");
                setSubject("");
              }}
            >
              + Raise Another Ticket
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function NewTicket() {
  const profile = useProfile("student");
  if (!profile) return <p className="p-8 text-sm">Loading…</p>;

  return (
    <Shell profile={profile} kind="student">
      <Suspense fallback={<p className="p-4 text-sm">Loading form…</p>}>
        <TicketForm profile={profile} />
      </Suspense>
    </Shell>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { authHeaders } from "@/lib/supabase-browser";
import VoiceInput from "./VoiceInput";

type Msg = { from: "me" | "ai"; text: string; ticket?: boolean; time?: string };

const SUGGESTIONS = [
  "💳 Check my course payment status",
  "📜 How do I get my certificate?",
  "💼 What internships are available?",
  "🆘 I have an LMS access problem",
];

export default function ChatWidget() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "ai",
      text: "Hello! I'm your Edura AI Support Assistant. Ask me about your courses, payments, certificates, internships, or raise a ticket.",
      time: "Just now",
    },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSend(queryText?: string) {
    const q = (queryText || text).trim();
    if (!q || busy) return;
    setText("");
    setBusy(true);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMsgs((m) => [...m, { from: "me", text: q, time: now }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ message: q }),
      });
      const j = await res.json();
      setMsgs((m) => [
        ...m,
        {
          from: "ai",
          text: (j.reply ?? j.error ?? "Something went wrong.") + (j.debug ? `\n\n[dev] ${j.debug}` : ""),
          ticket: j.suggestTicket,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        {
          from: "ai",
          text: "Sorry, I couldn't reach the support server. Please try again or raise a ticket directly.",
          ticket: true,
          time: now,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel flex flex-col h-[32rem] overflow-hidden border-gold/25 shadow-md">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-ink-dark via-ink to-zinc-900 text-white flex items-center justify-between border-b border-gold/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-xs font-bold text-ink shadow-sm">
            ✨
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">AI Support Assistant</h2>
            <div className="text-[10px] text-gold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span>Gemini 3.7 Active</span>
            </div>
          </div>
        </div>
        <Link
          href="/student/tickets/new"
          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gold/20 hover:text-gold text-white font-medium transition-colors border border-white/10"
        >
          + New Ticket
        </Link>
      </div>

      {/* Suggested Chips Bar (When only 1 message exists) */}
      {msgs.length === 1 && (
        <div className="p-2.5 bg-gold-soft/40 border-b border-gold/20 flex flex-wrap gap-1.5">
          <div className="w-full text-[10px] font-semibold text-gold-dark uppercase tracking-wider mb-0.5">
            Quick prompts:
          </div>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(s)}
              className="text-left text-[11px] bg-white border border-gold/30 hover:border-gold rounded-full px-2.5 py-1 text-ink/80 hover:text-gold-dark hover:bg-gold-soft transition-all shadow-2xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm bg-paper/50">
        {msgs.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed whitespace-pre-wrap ${
                m.from === "me"
                  ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-ink font-semibold rounded-br-xs shadow-xs"
                  : "bg-white border border-ink/10 text-ink rounded-bl-xs"
              }`}
            >
              {m.text}
            </div>

            {/* Time & Ticket Action */}
            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-ink/40">
              {m.time && <span>{m.time}</span>}
              {m.ticket && (
                <Link
                  href="/student/tickets/new"
                  className="font-semibold text-gold-dark hover:underline flex items-center gap-0.5"
                >
                  <span>Raise official ticket →</span>
                </Link>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-ink/60 bg-white border border-gold/30 rounded-2xl px-3.5 py-2 w-fit">
            <span className="animate-spin text-gold">🌀</span>
            <span>Gemini is generating a response…</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-ink/10 flex flex-col gap-2"
      >
        <div className="flex gap-2 items-center">
          <input
            className="input text-xs py-2 bg-paper/50 focus:bg-white flex-1"
            placeholder="Ask a question in English or Tamil…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={busy}
          />
          <button className="btn text-xs py-2 px-3 shrink-0" disabled={busy || !text.trim()}>
            <span>Send</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <div className="flex justify-between items-center px-1">
          <VoiceInput
            onTranscript={(t) => {
              setText((prev) => (prev ? `${prev} ${t}` : t));
            }}
          />
          <span className="text-[10px] text-ink/40">Powered by Gemini AI</span>
        </div>
      </form>
    </section>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import EduraLogo from "@/components/EduraLogo";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        : await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.name } },
          });
    setBusy(false);
    if (res.error) return setMsg(res.error.message);
    if (!res.data.session) return setMsg("Account created! Check your email or sign in directly.");
    router.replace("/");
  }

  function fillDemo(email: string) {
    setForm({ name: "Demo Student", email, password: "Demo@12345" });
    setMode("in");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-paper">
      {/* Left Branding Showcase */}
      <div className="bg-ink text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden border-r border-gold/20">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & Heading */}
        <div className="relative z-10 flex items-center gap-3.5">
          <EduraLogo size={52} className="shadow-xl shadow-gold/20 ring-1 ring-gold/30" />
          <div>
            <div className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Edura</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-mono font-bold border border-gold/30">
                AI v2.0
              </span>
            </div>
            <div className="text-[11px] text-gold font-bold tracking-wider uppercase mt-0.5">
              AI-POWERED SUPPORT & ACADEMY MANAGEMENT
            </div>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 my-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-gold/30 text-xs text-gold font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>AI-POWERED SUPPORT & ACADEMY MANAGEMENT</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white">
            Ask once. We route it, track it, and resolve it.
          </h1>

          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Centralized intelligence for student inquiries, course enrollments, automated SLA escalations, fee reconciliations, and instant verified certifications.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-gold/20 backdrop-blur-sm">
              <div className="text-gold text-xl mb-1">⚡</div>
              <div className="font-semibold text-xs text-white">Instant Gemini 3.7 AI</div>
              <div className="text-[11px] text-white/50 mt-0.5">Automatic intent & priority classification</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-gold/20 backdrop-blur-sm">
              <div className="text-gold text-xl mb-1">⏱️</div>
              <div className="font-semibold text-xs text-white">Auto SLA Escalations</div>
              <div className="text-[11px] text-white/50 mt-0.5">Proactive breach prevention alerts</div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Test Bar */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <div className="text-xs text-white/60 mb-2 flex items-center justify-between">
            <span>Demo accounts for evaluation:</span>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => fillDemo("aarav.kumar@demo.skillonex.test")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gold/20 hover:text-gold text-gold-light font-mono font-medium transition-colors border border-white/10"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@skillonex.test")}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gold/20 hover:text-gold text-white/80 font-mono font-medium transition-colors border border-white/10"
            >
              Staff / Admin
            </button>
          </div>
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="p-8 md:p-14 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center gap-2 justify-center md:justify-start lg:hidden mb-2">
              <EduraLogo size={36} />
              <span className="font-black text-xl text-ink">Edura</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
              {mode === "in" ? "Welcome back" : "Create student account"}
            </h2>
            <p className="text-sm text-ink/60">
              {mode === "in"
                ? "Enter your credentials to access your Edura dashboard."
                : "Sign up to access courses, submit tickets, and view certificates."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-ink/5 rounded-xl border border-ink/10">
            <button
              type="button"
              onClick={() => {
                setMode("in");
                setMsg("");
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === "in" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("up");
                setMsg("");
              }}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === "up" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                  Full Name
                </label>
                <input
                  className="input"
                  placeholder="e.g. Priya Sharma"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Email Address
              </label>
              <input
                className="input"
                type="email"
                placeholder="name@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1">
                Password
              </label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {msg && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  msg.includes("Account created")
                    ? "bg-ok-soft text-ok border border-ok/20"
                    : "bg-alert-soft text-alert border border-alert/20"
                }`}
                role="alert"
              >
                {msg}
              </div>
            )}

            <button
              className="btn w-full py-3 text-base justify-center shadow-md shadow-teal/10"
              disabled={busy}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin">🌀</span>
                  <span>Verifying credentials…</span>
                </span>
              ) : mode === "in" ? (
                "Sign In to Edura →"
              ) : (
                "Create Edura Account →"
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-ink/50">
            Protected by Supabase Auth with Role-Based Access Control.
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import type { Profile } from "@/lib/use-profile";
import EduraLogo from "./EduraLogo";

const NAV = {
  student: [
    {
      href: "/student",
      label: "Dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/student/tickets",
      label: "My Tickets",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
    {
      href: "/student/tickets/new",
      label: "Raise a Ticket",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ],
  staff: [
    {
      href: "/admin",
      label: "Academy Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/admin/tickets",
      label: "Support Queue",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ],
};

export default function Shell({
  profile,
  kind,
  children,
}: {
  profile: Profile;
  kind: "student" | "staff";
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = (profile.full_name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-ink text-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <EduraLogo size={40} className="shadow-md shadow-indigo-500/30" />
          <div>
            <div className="font-extrabold text-base tracking-tight leading-none text-white flex items-center gap-1.5">
              <span>Edura</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal/30 text-teal-soft font-mono">v2.0</span>
            </div>
            <div className="text-[9px] text-teal-soft font-bold tracking-wider uppercase mt-1">
              AI-POWERED SUPPORT & ACADEMY MANAGEMENT
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Main Left Side Panel / Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col bg-ink text-white w-full md:w-72 md:shrink-0 md:min-h-screen border-r border-white/10 p-5 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30 justify-between transition-all`}
      >
        <div className="space-y-6">
          {/* Logo, Heading & Tagline Left Panel Showcase */}
          <div className="pb-4 border-b border-white/10 space-y-3">
            <div className="flex items-center gap-3.5">
              <EduraLogo size={48} className="shadow-lg shadow-indigo-500/25 ring-1 ring-white/10" />
              <div>
                <div className="text-2xl font-black tracking-tight text-white flex items-center gap-2 leading-none">
                  <span>Edura</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal/25 text-teal-soft font-mono font-bold border border-teal/30">
                    AI v2.0
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white/60 uppercase tracking-widest mt-1.5">
                  {kind === "staff" ? "Academy Console" : "Student Portal"}
                </div>
              </div>
            </div>

            {/* Tagline Showcase Badge in Left Side Panel */}
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-teal-soft uppercase tracking-wider leading-relaxed flex items-center gap-1.5 shadow-2xs">
              <span className="text-amber text-xs">⚡</span>
              <span>AI-POWERED SUPPORT & ACADEMY MANAGEMENT</span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 mb-2">
              {kind === "staff" ? "Academy Management" : "Portal Navigation"}
            </div>
            <nav className="flex flex-col gap-1">
              {NAV[kind].map((item) => {
                const isActive = path === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-ink shadow-md font-bold"
                        : "text-white/70 hover:text-gold hover:bg-white/5"
                    }`}
                  >
                    <span className={isActive ? "text-ink" : "text-white/60"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card & Logout in Left Panel */}
        <div className="mt-8 pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gold/20 text-gold border border-gold/40 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="font-semibold text-sm text-white truncate">
                {profile.full_name || "User"}
              </div>
              <div className="text-xs text-gold/90 capitalize flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="font-medium">{profile.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-gold/10 hover:border-gold/30 hover:text-gold border border-white/10 py-2 text-xs font-semibold text-white/80 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

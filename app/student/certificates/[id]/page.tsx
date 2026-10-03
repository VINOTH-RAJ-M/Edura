"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import { useProfile } from "@/lib/use-profile";

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profile = useProfile("student");
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("certificates")
        .select("*, courses(*)")
        .eq("id", id)
        .single();
      if (err || !data) {
        setError("Certificate not found or unauthorized.");
      } else {
        setCert(data);
      }
      setLoading(false);
    })();
  }, [id, profile]);

  if (!profile || loading) {
    return <div className="p-8 text-sm text-center text-ink/70">Loading certificate…</div>;
  }

  if (error || !cert) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 panel text-center space-y-4">
        <p className="text-alert font-medium">{error || "Unable to view certificate"}</p>
        <Link href="/student" className="btn inline-block">Back to dashboard</Link>
      </div>
    );
  }

  const issueDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  return (
    <div className="min-h-screen bg-paper py-8 px-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Top action bar (hidden during print) */}
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center print:hidden">
        <Link href="/student" className="text-sm text-ink/70 hover:text-teal underline flex items-center gap-1">
          ← Back to student dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="btn flex items-center gap-2 shadow-sm"
        >
          <span>🖨️</span>
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Certificate Frame */}
      <div
        id="certificate-print-area"
        className="w-full max-w-4xl bg-white border-[10px] border-double border-teal/70 p-10 md:p-14 rounded-xl shadow-lg relative text-center text-ink overflow-hidden print:border-teal print:shadow-none print:m-0 print:max-w-full"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber" />

        {/* Certificate Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-teal" />
            <span className="tracking-widest uppercase text-xs font-bold text-teal-dark">
              EDURA ACADEMY
            </span>
            <span className="w-3 h-3 rounded-full bg-teal" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide text-ink font-sans">
            Certificate of Completion
          </h1>
          <div className="w-24 h-1 bg-amber mx-auto mt-3" />
        </div>

        <p className="text-base text-ink/70 italic mb-2">This is proudly awarded to</p>
        <h2 className="text-2xl md:text-4xl font-bold text-teal-dark font-sans tracking-tight py-2 border-b-2 border-dashed border-ink/20 inline-block px-8 mb-4">
          {profile.full_name || "Academy Student"}
        </h2>

        <p className="text-sm md:text-base text-ink/80 max-w-xl mx-auto leading-relaxed mb-6">
          for successfully completing the comprehensive coursework, practical assessments, and project requirements for
        </p>

        <h3 className="text-xl md:text-2xl font-bold text-ink bg-teal-soft/40 py-2.5 px-6 rounded-lg inline-block mb-8 border border-teal/20">
          {cert.courses?.title || "Specialized Program"}
        </h3>

        {/* Signatures and metadata */}
        <div className="grid grid-cols-3 items-end pt-8 mt-6 border-t border-ink/15 text-xs text-ink/70 gap-4">
          <div>
            <div className="font-semibold text-ink text-sm pb-1 border-b border-ink/40 mb-1">
              {cert.courses?.instructor || "Meera Nair"}
            </div>
            <div>Lead Instructor</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-2 border-teal flex items-center justify-center text-teal-dark font-bold text-xs mb-1 bg-teal-soft/30">
              SKX
            </div>
            <div className="font-mono text-[10px] text-ink/60">ID: SKX-CERT-{cert.id.toString().padStart(5, "0")}</div>
          </div>

          <div>
            <div className="font-semibold text-ink text-sm pb-1 border-b border-ink/40 mb-1">
              {issueDate}
            </div>
            <div>Date of Issue</div>
          </div>
        </div>
      </div>
    </div>
  );
}

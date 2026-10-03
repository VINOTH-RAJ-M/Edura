"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import ChatWidget from "@/components/ChatWidget";
import { Badge, fmt } from "@/components/Badges";
import { supabase, authHeaders } from "@/lib/supabase-browser";
import { useProfile } from "@/lib/use-profile";
import { CourseDetailModal, ResourceViewerModal } from "@/components/CourseDetailModal";

const TABS = [
  { id: "Overview", label: "Overview", icon: "📊" },
  { id: "Courses", label: "My Courses", icon: "📚" },
  { id: "Payments & certificates", label: "Payments & Certificates", icon: "💳" },
  { id: "Opportunities", label: "Opportunities", icon: "💼" },
] as const;

export default function StudentDashboard() {
  const profile = useProfile("student");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("Overview");
  const [d, setD] = useState<any>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedResourceTitle, setSelectedResourceTitle] = useState<string | null>(null);
  const [recs, setRecs] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      // Fetch academic data & AI personalized recommendations in parallel
      const [enr, pay, cert, ann, intern, res, tix] = await Promise.all([
        supabase.from("enrollments").select("*, courses(*)").eq("student_id", profile.id),
        supabase
          .from("payments")
          .select("*, courses(title)")
          .eq("student_id", profile.id)
          .order("paid_at", { ascending: false }),
        supabase.from("certificates").select("*, courses(title)").eq("student_id", profile.id),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("internships").select("*"),
        supabase.from("resources").select("*"),
        supabase
          .from("tickets")
          .select("id, ticket_no, subject, status, priority, created_at, category")
          .eq("student_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(6),
      ]);
      setD({
        enr: enr.data ?? [],
        pay: pay.data ?? [],
        cert: cert.data ?? [],
        ann: ann.data ?? [],
        intern: intern.data ?? [],
        res: res.data ?? [],
        tix: tix.data ?? [],
      });

      try {
        const recRes = await fetch("/api/student/recommendations", { headers: await authHeaders() });
        if (recRes.ok) {
          const recJson = await recRes.json();
          setRecs(recJson.recommendations);
        }
      } catch (e) {
        console.warn("Failed to load recommendations:", e);
      }
    })();
  }, [profile]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-sm text-ink/60">
        <span className="animate-spin mr-2">🌀</span> Loading student portal…
      </div>
    );
  }

  const studentFirstName = profile.full_name?.split(" ")[0] || "Student";
  const activeCoursesCount = d?.enr?.filter((e: any) => e.status === "active").length ?? 0;
  const openTicketsCount = d?.tix?.filter((t: any) => !["Resolved", "Closed"].includes(t.status)).length ?? 0;

  return (
    <Shell profile={profile} kind="student">
      {/* Student Welcome Banner */}
      <div className="panel p-6 md:p-8 bg-gradient-to-r from-ink-dark via-ink to-zinc-900 text-white rounded-2xl shadow-lg border border-gold/30 relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-gold font-mono border border-gold/20">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span>Student ID: {profile.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {studentFirstName} 👋
            </h1>
            <p className="text-sm text-white/70 max-w-xl leading-relaxed">
              Track course progress, view academic schedules, manage payment receipts, and get instant 24/7 AI-powered support.
            </p>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center border border-gold/30">
              <div className="text-xl font-bold text-gold">{activeCoursesCount}</div>
              <div className="text-[11px] text-white/60 uppercase">Enrolled</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-center border border-white/10">
              <div className="text-xl font-bold text-amber">{openTicketsCount}</div>
              <div className="text-[11px] text-white/60 uppercase">Open Issues</div>
            </div>
            <Link href="/student/tickets/new" className="btn shadow-md font-semibold">
              <span>+ Raise Ticket</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-ink/5 rounded-2xl border border-ink/10 overflow-x-auto mb-6" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              tab === t.id
                ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-ink shadow-md font-bold"
                : "text-ink/60 hover:text-gold-dark hover:bg-white/50"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {!d ? (
        <div className="panel p-12 text-center text-sm text-ink/60">
          <span className="animate-spin inline-block mr-2 text-gold">🌀</span> Synchronizing your academic records…
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_22rem] gap-6 items-start">
          {/* Main Tab Content */}
          <div className="space-y-6">
            {/* TAB 1: OVERVIEW */}
            {tab === "Overview" && (
              <>
                {/* Academic Snapshot & Profile */}
                <section className="panel p-5 bg-white shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-ink/10">
                    <h2 className="font-bold text-base text-ink flex items-center gap-2">
                      <span>👤</span> Academic Profile
                    </h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gold-soft text-gold-dark font-semibold border border-gold/30">
                      Enrolled Student
                    </span>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-paper rounded-lg">
                      <dt className="text-xs text-ink/50 uppercase font-semibold">Student Name</dt>
                      <dd className="font-bold text-ink mt-0.5">{profile.full_name}</dd>
                    </div>
                    <div className="p-3 bg-paper rounded-lg">
                      <dt className="text-xs text-ink/50 uppercase font-semibold">Email Address</dt>
                      <dd className="font-medium text-ink mt-0.5 truncate">{profile.email}</dd>
                    </div>
                    <div className="p-3 bg-paper rounded-lg">
                      <dt className="text-xs text-ink/50 uppercase font-semibold">Active Programs</dt>
                      <dd className="font-bold text-gold-dark mt-0.5">{activeCoursesCount} Courses Active</dd>
                    </div>
                  </dl>
                </section>

                {/* AI Personalized Learning & Career Recommendations */}
                {recs && (
                  <section className="panel p-5 bg-gradient-to-br from-gold-soft/40 via-white to-amber-soft/20 border-gold/40 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-ink/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <div>
                          <h2 className="font-bold text-base text-ink">AI Personalized Skill & Career Path</h2>
                          <p className="text-xs text-ink/50">Tailored recommendation based on your learning trajectory</p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-ink font-mono font-bold shadow-2xs">
                        Gemini AI Advisor
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-white border border-ink/10 space-y-2 shadow-2xs">
                        <div className="text-[11px] font-bold text-gold-dark uppercase tracking-wider">
                          Recommended Next Skill Track
                        </div>
                        <h3 className="font-bold text-sm text-ink">{recs.nextTrack}</h3>
                        <p className="text-xs text-ink/70 leading-relaxed">{recs.reason}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-ink/10 space-y-2 shadow-2xs">
                        <div className="text-[11px] font-bold text-amber uppercase tracking-wider">
                          Suggested Hands-on Capstones
                        </div>
                        <ul className="space-y-1.5 text-xs text-ink/80">
                          {(recs.recommendedProjects ?? []).map((proj: string, pIdx: number) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="text-gold-dark font-bold">▹</span>
                              <span>{proj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-gold-soft/60 border border-gold/30 text-xs text-gold-dark font-medium flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span>💡</span>
                        <span><b>Career Tip:</b> {recs.careerTip}</span>
                      </div>
                      <Link href="/student/tickets/new" className="text-gold-dark font-bold underline text-xs">
                        Ask Academic Advisor →
                      </Link>
                    </div>
                  </section>
                )}

                {/* Recent Announcements */}
                <section className="panel p-5 bg-white shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-ink/10">
                    <h2 className="font-bold text-base text-ink flex items-center gap-2">
                      <span>📢</span> Academy Announcements
                    </h2>
                    <span className="text-xs text-ink/50">{d.ann.length} updates</span>
                  </div>
                  {d.ann.length === 0 ? (
                    <p className="text-sm text-ink/60 py-2">No academy announcements at this time.</p>
                  ) : (
                    <div className="space-y-3">
                      {d.ann.map((a: any) => (
                        <div
                          key={a.id}
                          className="p-3.5 rounded-xl bg-paper/70 border border-ink/5 hover:border-teal/30 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-ink">{a.title}</h3>
                            <span className="text-[10px] text-ink/40 font-mono">{fmt(a.created_at)}</span>
                          </div>
                          <p className="text-xs text-ink/70 leading-relaxed">{a.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Support Requests & Complaints History */}
                <section className="panel p-5 bg-white shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-ink/10">
                    <div>
                      <h2 className="font-bold text-base text-ink flex items-center gap-2">
                        <span>🎫</span> Support & Complaints History
                      </h2>
                      <p className="text-xs text-ink/50 mt-0.5">Real-time status of your support inquiries</p>
                    </div>
                    <Link href="/student/tickets/new" className="btn text-xs px-3 py-1.5">
                      + Raise Ticket
                    </Link>
                  </div>

                  {d.tix.length === 0 ? (
                    <div className="p-6 text-center bg-paper/50 rounded-xl space-y-2">
                      <p className="text-sm text-ink/70">No support tickets found.</p>
                      <p className="text-xs text-ink/50">Need help with payments, LMS, or lectures? Raise a ticket and Gemini AI will route it instantly.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-ink/5">
                      {d.tix.map((t: any) => (
                        <li key={t.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                          <Link href={`/student/tickets/${t.id}`} className="group flex-1 min-w-[200px]">
                            <div className="font-semibold text-sm text-ink group-hover:text-teal transition-colors flex items-center gap-2">
                              <span className="font-mono text-xs text-teal font-bold">{t.ticket_no}</span>
                              <span className="truncate">{t.subject || "Support Inquiry"}</span>
                            </div>
                            <div className="text-[11px] text-ink/45 mt-0.5">
                              {t.category || "General"} • {fmt(t.created_at)}
                            </div>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge>{t.priority}</Badge>
                            <Badge>{t.status}</Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}

            {/* TAB 2: COURSES */}
            {tab === "Courses" && (
              <div className="space-y-4">
                {d.enr.length === 0 ? (
                  <div className="panel p-8 text-center text-ink/60">No enrolled courses found.</div>
                ) : (
                  d.enr.map((e: any) => (
                    <section key={e.id} className="panel p-6 bg-white shadow-sm space-y-4 border-l-4 border-teal">
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div>
                          <h2 className="text-lg font-bold text-ink">{e.courses?.title}</h2>
                          <p className="text-xs text-ink/60 mt-0.5 max-w-xl">{e.courses?.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCourse({ ...e.courses, progress: e.progress, attendance: e.attendance })}
                            className="btn text-xs px-3 py-1.5 shadow-2xs font-semibold"
                          >
                            <span>📚 View Syllabus & Modules</span>
                          </button>
                          <Badge>{e.status === "active" ? "Assigned" : "Waiting"}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-paper/60 p-3 rounded-xl border border-ink/5">
                        <div>
                          <span className="text-ink/50 block font-medium">Lead Instructor</span>
                          <span className="font-bold text-ink">{e.courses?.instructor || "Meera Nair"}</span>
                        </div>
                        <div>
                          <span className="text-ink/50 block font-medium">Batch Schedule</span>
                          <span className="font-semibold text-ink">{e.courses?.schedule || "Mon / Wed / Fri"}</span>
                        </div>
                        <div>
                          <span className="text-ink/50 block font-medium">Enrolled Date</span>
                          <span className="font-medium text-ink">{fmt(e.enrolled_at)}</span>
                        </div>
                      </div>

                      {/* Progress & Attendance Meters */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-ink/70">Course Completion Progress</span>
                            <span className="text-teal font-bold">{e.progress}%</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-ink/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal to-teal-dark transition-all duration-500"
                              style={{ width: `${e.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-ink/60 pt-1">
                          <span className="flex items-center gap-1.5">
                            <span>📅</span> Class Attendance: <b>{e.attendance}%</b>
                          </span>
                          <span className="text-[11px] text-ok font-semibold">Good Standing</span>
                        </div>
                      </div>

                      {/* Working Interactive Resources */}
                      {d.res.filter((r: any) => r.course_id === e.course_id).length > 0 && (
                        <div className="pt-3 border-t border-ink/10">
                          <div className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-2">
                            Interactive Course Workbooks & Cheatsheets
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {d.res
                              .filter((r: any) => r.course_id === e.course_id)
                              .map((r: any) => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => setSelectedResourceTitle(r.title)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-soft/50 hover:bg-teal-soft border border-teal/20 text-xs font-bold text-teal-dark transition-all hover:shadow-2xs"
                                >
                                  <span>📄</span>
                                  <span>{r.title}</span>
                                  <span className="text-[10px] font-normal opacity-70">↗</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </section>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: PAYMENTS & CERTIFICATES */}
            {tab === "Payments & certificates" && (
              <div className="space-y-6">
                {/* Payments Panel */}
                <section className="panel p-5 bg-white shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-ink/10">
                    <div>
                      <h2 className="font-bold text-base text-ink flex items-center gap-2">
                        <span>💳</span> Fee Payments & Receipts
                      </h2>
                      <p className="text-xs text-ink/50">Official billing and tuition payment ledger</p>
                    </div>
                  </div>

                  {d.pay.length === 0 ? (
                    <p className="text-sm text-ink/60 py-2">No payment transactions recorded.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-[10px] uppercase font-bold text-ink/50 bg-paper/80 border-b border-ink/10">
                          <tr>
                            <th className="py-2.5 px-3">Course / Item</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                          {d.pay.map((p: any) => (
                            <tr key={p.id} className="hover:bg-paper/50">
                              <td className="py-3 px-3 font-semibold text-ink">
                                {p.courses?.title || "Academic Tuition Fee"}
                              </td>
                              <td className="py-3 px-3 font-bold text-ink">
                                ₹{Number(p.amount).toLocaleString("en-IN")}
                              </td>
                              <td className="py-3 px-3">
                                <Badge>{p.status === "paid" ? "Resolved" : "Waiting"}</Badge>
                              </td>
                              <td className="py-3 px-3 text-right text-ink/50">{fmt(p.paid_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Certificates Section with Sample Illusion & Locking */}
                <section className="panel p-5 bg-white shadow-sm space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-ink/10 flex-wrap gap-2">
                    <div>
                      <h2 className="font-bold text-base text-ink flex items-center gap-2">
                        <span>📜</span> Course Certificates & Credentialing
                      </h2>
                      <p className="text-xs text-ink/50">
                        Complete 100% of your coursework to unlock and download verified certificates
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-teal-soft text-teal-dark font-semibold">
                      Automated Verification
                    </span>
                  </div>

                  {/* Course-wise Certificate Status Cards */}
                  <div className="space-y-4">
                    {d.enr.map((e: any) => {
                      const issuedCert = d.cert.find((c: any) => c.course_id === e.course_id);
                      const isCompleted = e.progress >= 100 || !!issuedCert;

                      return (
                        <div
                          key={e.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isCompleted
                              ? "bg-ok-soft/30 border-ok/30"
                              : "bg-gradient-to-br from-white via-paper/60 to-cyan-50/40 border-cyan-200/60 shadow-xs"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Course info & status */}
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-base text-ink">
                                  {e.courses?.title || "Enrolled Course"}
                                </h3>
                                {isCompleted ? (
                                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-ok text-white font-bold flex items-center gap-1">
                                    <span>✓</span>
                                    <span>Unlocked & Ready</span>
                                  </span>
                                ) : (
                                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-soft text-amber font-bold border border-amber/20 flex items-center gap-1">
                                    <span>🔒</span>
                                    <span>Locked ({e.progress}% Completed)</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-ink/60">
                                Instructor: {e.courses?.instructor || "Academy Staff"} • Progress: {e.progress}%
                              </p>

                              {/* Progress towards unlocking */}
                              {!isCompleted && (
                                <div className="space-y-1 max-w-md pt-1">
                                  <div className="flex justify-between text-[11px] text-ink/60 font-medium">
                                    <span>Completion required to unlock:</span>
                                    <span className="font-bold text-teal">{e.progress}% / 100%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-teal to-cyan-500"
                                      style={{ width: `${e.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Certificate Thumbnail Preview & Action Button */}
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Sample Certificate Illusion Thumbnail */}
                              <div
                                onClick={() => setSelectedCert(e)}
                                className="relative w-28 h-18 rounded-lg overflow-hidden border-2 border-cyan-400/60 shadow-md shadow-cyan-500/20 cursor-pointer group shrink-0"
                                title="Click to view sample certificate preview"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/sample-certificate.png"
                                  alt="Sample Certificate"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Light Blue Glowing Effect & Sample Watermark Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-sky-400/20 to-blue-600/30 backdrop-blur-[0.5px] flex items-center justify-center">
                                  <span className="text-[10px] font-black tracking-widest text-white uppercase bg-cyan-600/80 px-1.5 py-0.5 rounded rotate-[-12deg] shadow-sm border border-cyan-200/50">
                                    SAMPLE
                                  </span>
                                </div>

                                {!isCompleted && (
                                  <div className="absolute top-1 right-1 bg-ink/80 text-white text-[9px] p-0.5 rounded-full w-4 h-4 flex items-center justify-center">
                                    🔒
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-1.5">
                                {isCompleted ? (
                                  <Link
                                    href={issuedCert ? `/student/certificates/${issuedCert.id}` : "#"}
                                    className="btn text-xs px-3.5 py-2 shadow-sm font-semibold"
                                  >
                                    <span>📄</span>
                                    <span>Download PDF</span>
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCert(e)}
                                    className="btn-ghost text-xs px-3 py-1.5 border-cyan-300/80 text-teal-dark bg-cyan-50/50 hover:bg-cyan-100/60 font-semibold shadow-2xs"
                                  >
                                    <span>👁️ Preview Sample</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 4: OPPORTUNITIES */}
            {tab === "Opportunities" && (
              <section className="panel p-5 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-ink/10">
                  <div>
                    <h2 className="font-bold text-base text-ink flex items-center gap-2">
                      <span>💼</span> Placement & Internship Openings
                    </h2>
                    <p className="text-xs text-ink/50">Exclusive industry openings for verified academy students</p>
                  </div>
                </div>

                {d.intern.length === 0 ? (
                  <p className="text-sm text-ink/60 py-2">No active internship openings right now.</p>
                ) : (
                  <div className="grid gap-3">
                    {d.intern.map((i: any) => (
                      <div
                        key={i.id}
                        className="p-4 rounded-xl bg-paper/60 border border-ink/5 flex items-center justify-between gap-4 flex-wrap hover:border-teal/30 hover:bg-white transition-all shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-ink">{i.role}</h3>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-soft text-teal-dark font-medium">
                              {i.location || "Remote"}
                            </span>
                          </div>
                          <div className="text-xs text-ink/60 flex items-center gap-2">
                            <span>🏢 {i.company}</span>
                            <span>•</span>
                            <span>Full-time Internship</span>
                          </div>
                        </div>

                        <Link
                          href={`/student/tickets/new?role=${encodeURIComponent(i.role)}&company=${encodeURIComponent(i.company)}`}
                          className="btn text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Apply via Support</span>
                          <span>→</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column: AI Support Assistant Widget */}
          <div className="sticky top-6">
            <ChatWidget />
          </div>
        </div>
      )}

      {/* Interactive Sample Certificate Illusion Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-cyan-300/60 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-ink/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="font-bold text-base text-ink">
                    Sample Certificate Preview — {selectedCert.courses?.title || "Course"}
                  </h3>
                  <p className="text-xs text-ink/50">
                    Official completion credential (Locked at {selectedCert.progress}% progress)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="w-8 h-8 rounded-full bg-ink/5 hover:bg-ink/10 text-ink flex items-center justify-center font-bold text-sm transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Sample Certificate Image with Light-Blue Glow and Watermark Overlay */}
            <div className="relative rounded-xl overflow-hidden border-2 border-cyan-400 shadow-xl shadow-cyan-500/30 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sample-certificate.png"
                alt="Sample Certificate"
                className="w-full h-auto object-cover block"
              />

              {/* Light Blue Illusion Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 via-sky-400/20 to-blue-600/30 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                {/* Large Glowing SAMPLE Watermark */}
                <div className="border-4 border-cyan-300/80 bg-cyan-950/60 px-8 py-3 rounded-2xl shadow-2xl shadow-cyan-400/50 rotate-[-12deg] backdrop-blur-xs">
                  <span className="text-3xl sm:text-5xl font-black tracking-[0.25em] text-cyan-200 uppercase drop-shadow-[0_4px_12px_rgba(6,182,212,0.8)]">
                    SAMPLE
                  </span>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-ink/80 text-cyan-200 text-xs font-semibold tracking-wide border border-cyan-400/40">
                  🔒 Locked Preview • Complete 100% Coursework to Unlock
                </div>
              </div>
            </div>

            {/* Modal Footer / Requirements Explanation */}
            <div className="bg-cyan-50/60 border border-cyan-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-teal-dark block text-sm mb-0.5">
                  How to unlock your verified certificate?
                </span>
                <span className="text-ink/70">
                  Reach 100% progress in lectures, quizzes, and project submissions to receive your personalized credential.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="btn text-xs px-4 py-2 shrink-0 font-semibold"
              >
                Continue Learning →
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Interactive Course Detail & Syllabus Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          progress={selectedCourse.progress}
          attendance={selectedCourse.attendance}
          onClose={() => setSelectedCourse(null)}
          onOpenResource={(title) => setSelectedResourceTitle(title)}
        />
      )}

      {/* Interactive Resource Viewer Modal */}
      {selectedResourceTitle && (
        <ResourceViewerModal
          resourceTitle={selectedResourceTitle}
          onClose={() => setSelectedResourceTitle(null)}
        />
      )}
    </Shell>
  );
}

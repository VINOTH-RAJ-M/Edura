"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Shell from "@/components/Shell";
import { authHeaders } from "@/lib/supabase-browser";
import { useProfile } from "@/lib/use-profile";

const COLORS = ["#D4AF37", "#0D0D11", "#AA820A", "#E5C06A", "#71717A", "#C59B27", "#E11D48"];

const Stat = ({
  label,
  value,
  warn,
  sub,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  warn?: boolean;
  sub?: string;
  icon?: string;
}) => (
  <div className="panel p-4 bg-white flex flex-col justify-between hover:border-gold/50 transition-all shadow-2xs">
    <div className="flex items-center justify-between gap-1 text-ink/60">
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      {icon && <span className="text-sm">{icon}</span>}
    </div>
    <div className={`text-2xl font-black mt-1 ${warn ? "text-alert" : "text-ink"}`}>{value}</div>
    {sub && <div className="text-[11px] text-ink/50 mt-0.5">{sub}</div>}
  </div>
);

export default function AdminHome() {
  const profile = useProfile("staff");
  const [s, setS] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [insights, setInsights] = useState<string[] | null>(null);
  const [insightsSource, setInsightsSource] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  // Trend Chart Mode: "overall" | "categories"
  const [trendView, setTrendView] = useState<"overall" | "categories">("overall");

  // AI Executive Report State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/stats", { headers: await authHeaders() });
      if (r.ok) {
        setS(await r.json());
      }
    } catch (e: any) {
      console.error("Failed to load stats:", e);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const r = await fetch("/api/admin/insights", { headers: await authHeaders() });
      const j = await r.json();
      if (!r.ok) {
        setInsightsError(j.error ?? "Failed to fetch AI insights");
      } else {
        setInsights(j.insights ?? []);
        setInsightsSource(j.source ?? "");
      }
    } catch (e: any) {
      setInsightsError(e?.message ?? "Error fetching insights");
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  // Auto-escalation on mount
  useEffect(() => {
    if (!profile) return;
    let isMounted = true;
    (async () => {
      try {
        const r = await fetch("/api/cron/escalate", { headers: await authHeaders() });
        const j = await r.json();
        if (isMounted && j.escalated && j.escalated > 0) {
          setMsg(`${j.escalated} overdue ticket(s) auto-escalated.`);
        }
      } catch (e) {
        console.error("Auto escalation check error", e);
      }
      if (isMounted) {
        loadStats();
        loadInsights();
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [profile, loadStats, loadInsights]);

  async function escalate() {
    setMsg("Checking SLA breaches…");
    try {
      const r = await fetch("/api/cron/escalate", { headers: await authHeaders() });
      const j = await r.json();
      setMsg(`${j.escalated ?? 0} ticket(s) escalated to High.`);
      loadStats();
    } catch (e: any) {
      setMsg("Escalation check error.");
    }
  }

  async function generateAIReport() {
    setReportModalOpen(true);
    if (reportData) return;
    setReportLoading(true);
    try {
      const res = await fetch("/api/admin/report", {
        method: "POST",
        headers: await authHeaders(),
      });
      if (res.ok) {
        const j = await res.json();
        setReportData(j.report);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setReportLoading(false);
    }
  }

  if (!profile) return <p className="p-8 text-sm">Loading…</p>;

  return (
    <Shell profile={profile} kind="staff">
      {/* Header Banner */}
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-ink/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
            Academy Operations Overview
          </h1>
          <p className="text-sm text-ink/60 mt-0.5">
            Real-time telemetry on student support queues, SLA escalations, courses, and financial collections
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {msg && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-soft text-teal-dark border border-teal/20" aria-live="polite">
              {msg}
            </span>
          )}
          <button
            type="button"
            onClick={generateAIReport}
            className="btn bg-ink hover:bg-ink/90 text-white text-xs px-3.5 py-2 shadow-xs font-semibold flex items-center gap-1.5"
          >
            <span>📊</span>
            <span>Generate AI Executive Report</span>
          </button>
          <button className="btn-ghost text-xs px-3.5 py-2 shadow-xs" onClick={escalate}>
            <span>⚡ Run Escalation Check</span>
          </button>
        </div>
      </div>

      {/* Task 1: AI Insights Card */}
      <section className="mt-6 panel p-6 border-teal/30 bg-gradient-to-br from-teal-soft/20 via-white to-amber-soft/15 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✨</span>
            <h2 className="text-base font-bold text-ink tracking-tight">AI Insights & Operations Copilot</h2>
            {insightsSource && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal text-white font-medium font-mono shadow-2xs">
                {insightsSource === "ai" ? "Gemini 3.7 Pro" : "Rule Engine"}
              </span>
            )}
          </div>
          <button
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 bg-white/90"
            onClick={loadInsights}
            disabled={insightsLoading}
          >
            <span className={insightsLoading ? "animate-spin" : ""}>🔄</span>
            <span>{insightsLoading ? "Analyzing…" : "Refresh Insights"}</span>
          </button>
        </div>

        {insightsLoading && !insights ? (
          <div className="py-8 flex items-center justify-center gap-2.5 text-sm text-ink/60">
            <span className="animate-spin text-teal">🌀</span>
            <span>Gemini AI is analyzing ticket queues, SLA compliance, student sentiment, and revenue metrics…</span>
          </div>
        ) : insightsError ? (
          <div className="p-3.5 text-sm text-alert bg-alert-soft rounded-lg flex items-center justify-between border border-alert/20">
            <span>{insightsError}</span>
            <button className="underline text-xs font-bold" onClick={loadInsights}>
              Retry Analysis
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3.5">
            {(insights ?? []).map((item, idx) => (
              <div
                key={idx}
                className="bg-white/95 border border-ink/10 rounded-xl p-4 text-sm text-ink/90 flex gap-3 items-start shadow-2xs hover:border-teal/50 hover:shadow-xs transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-teal mt-2 shrink-0" />
                <p className="leading-relaxed text-xs md:text-sm">{item}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {!s ? (
        <div className="panel p-12 text-center text-sm text-ink/60 mt-6">
          <span className="animate-spin inline-block mr-2 text-teal">🌀</span> Loading analytics and operations data…
        </div>
      ) : (
        <>
          {/* Key Metric Stats Grid (12 KPI Cards) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            <Stat label="Total Students" value={s.totalStudents} icon="👥" sub="Registered accounts" />
            <Stat label="Active Learners" value={s.activeStudents} icon="🎓" sub="Enrolled in live batches" />
            <Stat label="Course Enrollments" value={s.totalEnrollments} icon="📚" sub="Total course seats" />
            <Stat label="New This Week" value={`+${s.newEnrollments}`} icon="📈" sub="Past 7 days" />
            <Stat label="Total Revenue" value={`₹${s.revenue.toLocaleString("en-IN")}`} icon="💰" sub="Cleared fee payments" />
            <Stat label="Pending Complaints" value={s.pendingComplaints} icon="🎫" warn={s.pendingComplaints > 5} sub="Active in support queue" />
            <Stat label="Resolved Complaints" value={s.resolvedComplaints} icon="✅" sub="Successfully closed" />
            <Stat label="High Priority Open" value={s.highPriority} icon="⚡" warn={s.highPriority > 0} sub="Needs immediate focus" />
            <Stat label="Avg Resolution" value={`${s.avgResolutionHours}h`} icon="⏱️" sub="Turnaround time" />
            <Stat label="SLA Escalated" value={s.escalated} icon="🔥" warn={s.escalated > 0} sub="Overdue tickets" />
            <Stat label="Student Satisfaction" value={s.avgRating ? `${s.avgRating} / 5` : "N/A"} icon="⭐" sub="Student rating score" />
            <Stat label="Pending Invoices" value={s.pendingPayments} icon="💳" sub="Awaiting reconciliation" />
          </div>

          {/* Task 5 & Multi-Category Time Trends */}
          <div className="mt-6 grid lg:grid-cols-2 gap-5">
            {/* 14-day Influx & Category Breakdown Line Chart */}
            <section className="panel p-5 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h2 className="font-bold text-base text-ink">Ticket Volume & Category Trends (14 Days)</h2>
                  <div className="flex gap-1 bg-ink/5 p-1 rounded-lg border border-ink/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setTrendView("overall")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        trendView === "overall" ? "bg-white text-ink shadow-2xs" : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      Overall
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendView("categories")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        trendView === "categories" ? "bg-white text-ink shadow-2xs" : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      Category Breakdown
                    </button>
                  </div>
                </div>
                <p className="text-xs text-ink/50 mb-4">
                  {trendView === "overall"
                    ? "Daily volume of support inquiries and complaint tickets raised over time"
                    : "Time-series trend analysis across Payment, Technical, Enrollment, and Course categories"}
                </p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {trendView === "overall" ? (
                    <LineChart data={s.ticketTrends ?? []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A8B99" }} stroke="#CBD5E1" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7A8B99" }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0E1B2C",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                        itemStyle={{ color: "#DCEFEF" }}
                        formatter={(val: any) => [`${val} ticket(s)`, "Volume"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#D4AF37"
                        strokeWidth={3}
                        dot={{ r: 3.5, fill: "#D4AF37", stroke: "#0D0D11", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#D4AF37" }}
                      />
                    </LineChart>
                  ) : (
                    <LineChart data={s.ticketTrends ?? []} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A8B99" }} stroke="#CBD5E1" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7A8B99" }} stroke="#CBD5E1" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0D0D11",
                          color: "#FFFFFF",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "11px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                      <Line type="monotone" dataKey="Payment" stroke="#D4AF37" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Technical Issue" stroke="#E11D48" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Enrollment" stroke="#AA820A" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Course Content" stroke="#0D0D11" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Certificate" stroke="#C59B27" strokeWidth={2} dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </section>

            {/* Detailed Satisfaction Analysis & CSAT Breakdown */}
            <section className="panel p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="font-bold text-base text-ink">Student Satisfaction & CSAT Analysis</h2>
                  <p className="text-xs text-ink/50">Comprehensive rating distribution and Net Promoter Score (NPS)</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ok-soft text-ok">
                  {s.satisfactionAnalysis?.csatPercentage ?? 100}% Positive CSAT
                </span>
              </div>

              {/* CSAT & NPS Summary Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-paper/80 border border-ink/5 rounded-xl">
                  <div className="text-[10px] text-ink/50 font-semibold uppercase">Avg Rating</div>
                  <div className="text-lg font-black text-amber mt-0.5">
                    {s.satisfactionAnalysis?.avgRating ? `${s.satisfactionAnalysis.avgRating} ★` : "5.0 ★"}
                  </div>
                  <div className="text-[10px] text-ink/40">{s.satisfactionAnalysis?.totalRatings ?? 0} reviews</div>
                </div>

                <div className="p-3 bg-gold-soft/50 border border-gold/30 rounded-xl">
                  <div className="text-[10px] text-gold-dark font-semibold uppercase">CSAT %</div>
                  <div className="text-lg font-black text-gold-dark mt-0.5">
                    {s.satisfactionAnalysis?.csatPercentage ?? 100}%
                  </div>
                  <div className="text-[10px] text-gold-dark/70">4★ & 5★ ratings</div>
                </div>

                <div className="p-3 bg-ok-soft/50 border border-ok/20 rounded-xl">
                  <div className="text-[10px] text-ok font-semibold uppercase">NPS Score</div>
                  <div className="text-lg font-black text-ok mt-0.5">
                    +{s.satisfactionAnalysis?.npsScore ?? 80}
                  </div>
                  <div className="text-[10px] text-ok/70">Promoter index</div>
                </div>
              </div>

              {/* Star Distribution Progress Bars (5★ to 1★) */}
              <div className="space-y-2 pt-1">
                {(s.satisfactionAnalysis?.ratingDistribution ?? []).map((r: any) => (
                  <div key={r.starNum} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-bold text-ink/70 shrink-0">{r.stars}</span>
                    <div className="flex-1 h-2 rounded-full bg-ink/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-ink/60 text-[11px] font-mono shrink-0">
                      {r.count} ({r.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Predictive SLA Breach Monitor & Payment Overview */}
          <div className="mt-6 grid lg:grid-cols-2 gap-5">
            {/* Predictive SLA Risk & Triage Radar */}
            <section className="panel p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <h2 className="font-bold text-base text-ink">Predictive SLA Breach Monitor</h2>
                    <p className="text-xs text-ink/50">Proactive early warning system for high-risk open tickets</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-alert-soft text-alert font-bold">
                  {s.predictiveRisks?.length ?? 0} High Risk
                </span>
              </div>

              {(!s.predictiveRisks || s.predictiveRisks.length === 0) ? (
                <div className="p-6 text-center bg-ok-soft/30 rounded-xl border border-ok/20 space-y-1">
                  <p className="text-sm font-bold text-ok">All Tickets Safe within SLA Limits</p>
                  <p className="text-xs text-ink/60">No pending inquiries are at risk of breaching response deadlines.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {s.predictiveRisks.map((risk: any) => (
                    <div
                      key={risk.id}
                      className={`p-3 rounded-xl border transition-all ${
                        risk.riskLevel === "Critical"
                          ? "bg-alert-soft/50 border-alert/30"
                          : "bg-amber-soft/40 border-amber/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink">{risk.ticket_no}</span>
                          <span className="text-xs font-bold text-ink truncate max-w-[180px]">{risk.subject}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            risk.riskLevel === "Critical" ? "bg-alert text-white" : "bg-amber text-white"
                          }`}
                        >
                          {risk.riskLevel === "Critical" ? "Breached / Imminent" : `${risk.hoursLeft}h left`}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink/70 flex items-center justify-between gap-2 mt-1">
                        <span>Dept: <b>{risk.department}</b> • Cat: <b>{risk.category}</b></span>
                        <span className="text-ink/50 italic text-[10px]">{risk.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Task 2: Payment & Revenue Overview */}
            <section className="panel p-5 bg-white shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-base text-ink">Payment & Revenue Overview</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold-soft text-gold-dark border border-gold/30">
                    ₹{(s.revenue ?? 0).toLocaleString("en-IN")} Total
                  </span>
                </div>
                <p className="text-xs text-ink/50">Tuition collection status and course-level earnings</p>
              </div>

              {/* Status Breakdown Chips */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-ok-soft/60 border border-ok/20 rounded-xl">
                  <div className="text-[11px] text-ink/60 font-semibold uppercase">Paid</div>
                  <div className="text-lg font-black text-ok mt-0.5">
                    ₹{(s.paymentsOverview?.paid?.amount ?? 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-ink/50">{s.paymentsOverview?.paid?.count ?? 0} orders</div>
                </div>

                <div className="p-3 bg-gold-soft/60 border border-gold/30 rounded-xl">
                  <div className="text-[11px] text-ink/60 font-semibold uppercase">Pending</div>
                  <div className="text-lg font-black text-gold-dark mt-0.5">
                    ₹{(s.paymentsOverview?.pending?.amount ?? 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-ink/50">{s.paymentsOverview?.pending?.count ?? 0} invoices</div>
                </div>

                <div className="p-3 bg-alert-soft/60 border border-alert/20 rounded-xl">
                  <div className="text-[11px] text-ink/60 font-semibold uppercase">Failed</div>
                  <div className="text-lg font-black text-alert mt-0.5">
                    ₹{(s.paymentsOverview?.failed?.amount ?? 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-ink/50">{s.paymentsOverview?.failed?.count ?? 0} failed</div>
                </div>
              </div>

              {/* Revenue by course list */}
              <div>
                <div className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2">
                  Revenue Breakdown by Course
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {(s.paymentsOverview?.revenueByCourse ?? []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-ink/5">
                      <span className="font-semibold text-ink truncate max-w-[60%]">{item.name}</span>
                      <div className="text-right">
                        <span className="font-bold text-ink">₹{item.amount.toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-ink/50 ml-1.5">({item.count} enrollments)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Operational Analytics Charts Grid */}
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <section className="panel p-5 bg-white shadow-sm">
              <h2 className="font-bold text-base text-ink mb-1">Common Issue Categories</h2>
              <p className="text-xs text-ink/50 mb-3">Volume distribution across student complaint topics</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.byCategory} layout="vertical" margin={{ left: 40, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDF2F7" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                    <Bar dataKey="value" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel p-5 bg-white shadow-sm">
              <h2 className="font-bold text-base text-ink mb-1">Tickets by Department Queue</h2>
              <p className="text-xs text-ink/50 mb-3">Workload distribution across academy units</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={s.byDepartment} dataKey="value" nameKey="name" outerRadius={90} label>
                      {s.byDepartment.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel p-5 bg-white shadow-sm">
              <h2 className="font-bold text-base text-ink mb-1">Student Sentiment Analysis</h2>
              <p className="text-xs text-ink/50 mb-3">AI-classified emotion profile of tickets</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.bySentiment}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                    <Bar dataKey="value" fill="#AA820A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel p-5 bg-white shadow-sm">
              <h2 className="font-bold text-base text-ink mb-1">Enrollments by Course</h2>
              <p className="text-xs text-ink/50 mb-3">Active student cohort distribution</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.byCourse}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                    <Bar dataKey="value" fill="#0D0D11" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </>
      )}

      {/* AI Executive Report Modal */}
      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setReportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-ink/10 space-y-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ink/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-extrabold text-lg text-ink">
                    {reportData?.title || "Executive Operations & Predictive Report"}
                  </h3>
                  <p className="text-xs text-ink/50">Generated via Gemini 3.7 Pro AI Operations Strategist</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-ink/5 hover:bg-ink/10 text-ink flex items-center justify-center font-bold text-sm transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {reportLoading ? (
              <div className="py-16 text-center space-y-3 text-ink/60">
                <span className="animate-spin text-3xl inline-block text-teal">🌀</span>
                <p className="text-sm font-semibold">Synthesizing telemetry across queues, tickets, revenue, and satisfaction…</p>
              </div>
            ) : reportData ? (
              <div className="space-y-6 text-sm">
                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-paper/80 border border-ink/10 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-dark">Executive Summary</div>
                  <p className="text-ink/80 leading-relaxed">{reportData.executiveSummary}</p>
                </div>

                {/* KPI Highlights Matrix */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink/50">Key Operational Health Matrix</div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {reportData.kpiHighlights?.map((kpi: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border bg-white space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink">{kpi.metric}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              kpi.status === "Healthy"
                                ? "bg-ok-soft text-ok"
                                : kpi.status === "Critical"
                                ? "bg-alert-soft text-alert"
                                : "bg-amber-soft text-amber"
                            }`}
                          >
                            {kpi.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink/60">{kpi.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-depth Sections */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-teal-dark flex items-center gap-1.5">
                      <span>⏱️</span> Support Queue & SLA Risk
                    </h4>
                    <p className="text-xs text-ink/70 leading-relaxed">{reportData.slaAndRiskAnalysis}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-teal-dark flex items-center gap-1.5">
                      <span>⭐</span> Student Satisfaction & Feedback
                    </h4>
                    <p className="text-xs text-ink/70 leading-relaxed">{reportData.satisfactionAnalysis}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-teal-dark flex items-center gap-1.5">
                    <span>💳</span> Tuition Collection & Financial Health
                  </h4>
                  <p className="text-xs text-ink/70 leading-relaxed">{reportData.revenueAndBillingAnalysis}</p>
                </div>

                {/* Strategic Action Matrix */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink/50">
                    Recommended 30-Day Strategic Action Items
                  </div>
                  <div className="space-y-2">
                    {reportData.strategicActionItems?.map((action: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-paper/60 border border-ink/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              action.priority === "P1"
                                ? "bg-alert-soft text-alert"
                                : action.priority === "P2"
                                ? "bg-amber-soft text-amber"
                                : "bg-teal-soft text-teal-dark"
                            }`}
                          >
                            {action.priority}
                          </span>
                          <span className="font-semibold text-ink">{action.action}</span>
                        </div>
                        <span className="text-[11px] text-ink/50 shrink-0 font-medium">Owner: {action.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-ink/10 flex justify-between items-center gap-3">
                  <span className="text-xs text-ink/40 font-mono">
                    Report Timestamp: {new Date(reportData.generatedAt).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="btn-ghost text-xs px-3.5 py-1.5"
                    >
                      <span>🖨️ Print / Save PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      className="btn text-xs px-4 py-1.5"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Shell>
  );
}

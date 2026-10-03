import { NextRequest, NextResponse } from "next/server";
import { admin, getUser, isStaff } from "@/lib/supabase-server";
import { callGeminiJSON } from "@/lib/ai/gemini";

function generateFallbackInsights(summary: {
  openCount: number;
  escalatedCount: number;
  highPriorityCount: number;
  topCategory: { name: string; count: number } | null;
  topDept: { name: string; count: number } | null;
  negativeSentimentCount: number;
  avgResolutionHours: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
}): string[] {
  const insights: string[] = [];

  if (summary.escalatedCount > 0) {
    insights.push(
      `🚨 ${summary.escalatedCount} ticket(s) have breached SLA and are auto-escalated to High priority. Immediate supervisor review recommended.`
    );
  } else if (summary.highPriorityCount > 0) {
    insights.push(
      `⚡ ${summary.highPriorityCount} high-priority complaint(s) currently open. Resolve before SLA breaches occur.`
    );
  } else {
    insights.push(`✅ SLA health is strong: zero open escalated tickets across all active queues.`);
  }

  if (summary.topDept && summary.topDept.count > 0) {
    insights.push(
      `📌 ${summary.topDept.name} has the highest ticket volume (${summary.topDept.count} tickets, primarily in ${summary.topCategory?.name ?? "general queries"}).`
    );
  }

  if (summary.negativeSentimentCount > 0) {
    insights.push(
      `⚠️ ${summary.negativeSentimentCount} student(s) expressed frustrated or angry sentiment. Proactive follow-ups can improve retention.`
    );
  } else {
    insights.push(`💬 Student sentiment is currently stable with positive or neutral ratings.`);
  }

  if (summary.pendingPaymentsCount > 0) {
    insights.push(
      `💳 ₹${summary.pendingPaymentsAmount.toLocaleString("en-IN")} in pending payments (${summary.pendingPaymentsCount} students). Automated reminders may speed up fee clearance.`
    );
  } else {
    insights.push(`✨ Average resolution turnaround is ${summary.avgResolutionHours} hours across closed complaints.`);
  }

  return insights.slice(0, 4);
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!isStaff(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = admin();
  const [students, payments, tickets] = await Promise.all([
    db.from("profiles").select("id").eq("role", "student"),
    db.from("payments").select("student_id, amount, status"),
    db.from("tickets").select("category, priority, status, sentiment, escalated, created_at, resolved_at, departments(name)"),
  ]);

  const studentIds = new Set((students.data ?? []).map((x) => x.id));
  const pay = (payments.data ?? []).filter((x) => studentIds.has(x.student_id));
  const t = tickets.data ?? [];

  const openTickets = t.filter((x) => !["Resolved", "Closed"].includes(x.status));
  const doneTickets = t.filter((x) => x.resolved_at);
  const avgHours = doneTickets.length
    ? doneTickets.reduce((s, x) => s + (+new Date(x.resolved_at!) - +new Date(x.created_at)), 0) / doneTickets.length / 3600_000
    : 0;

  const categoryCounts: Record<string, number> = {};
  const deptCounts: Record<string, number> = {};
  let negativeSentimentCount = 0;

  for (const ticket of openTickets) {
    const cat = ticket.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;

    const deptName = (ticket.departments as any)?.name ?? "Unassigned";
    deptCounts[deptName] = (deptCounts[deptName] ?? 0) + 1;

    if (ticket.sentiment === "Frustrated" || ticket.sentiment === "Angry") {
      negativeSentimentCount++;
    }
  }

  const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const topDeptEntry = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];

  const pendingPayments = pay.filter((p) => p.status === "pending");
  const pendingPaymentsCount = pendingPayments.length;
  const pendingPaymentsAmount = pendingPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const summary = {
    openCount: openTickets.length,
    escalatedCount: openTickets.filter((x) => x.escalated).length,
    highPriorityCount: openTickets.filter((x) => x.priority === "High").length,
    topCategory: topCategoryEntry ? { name: topCategoryEntry[0], count: topCategoryEntry[1] } : null,
    topDept: topDeptEntry ? { name: topDeptEntry[0], count: topDeptEntry[1] } : null,
    negativeSentimentCount,
    avgResolutionHours: Math.round(avgHours * 10) / 10,
    pendingPaymentsCount,
    pendingPaymentsAmount,
  };

  const systemPrompt = `You are an AI academy operations analyst for Edura (AI-Powered Support & Academy Management).
You are given current operational metrics regarding student support tickets, department queues, student sentiment, resolution speed, and pending payments.
Generate exactly 3 to 4 concise, sharp, actionable executive insights or recommendations for the academy administrator.
Each insight must be 1-2 sentences, highly specific, and provide clear operational advice (e.g. staffing adjustments, proactive student outreach, payment reminders, SLA attention).
Respond with valid JSON in this exact structure:
{
  "insights": [
    "string insight 1",
    "string insight 2",
    "string insight 3"
  ]
}`;

  const userPrompt = `Here are the latest metrics:
- Open tickets: ${summary.openCount} (High Priority: ${summary.highPriorityCount}, SLA Escalated: ${summary.escalatedCount})
- Top complaint category: ${summary.topCategory ? `${summary.topCategory.name} (${summary.topCategory.count} open)` : "None"}
- Top department queue: ${summary.topDept ? `${summary.topDept.name} (${summary.topDept.count} open)` : "None"}
- Students with negative/frustrated sentiment: ${summary.negativeSentimentCount}
- Average resolution time: ${summary.avgResolutionHours} hours
- Pending student payments: ${summary.pendingPaymentsCount} (totaling ₹${summary.pendingPaymentsAmount.toLocaleString("en-IN")})

Provide 3-4 actionable insights as JSON.`;

  try {
    const res = await callGeminiJSON<{ insights: string[] }>(systemPrompt, userPrompt, 0.3);
    if (Array.isArray(res?.insights) && res.insights.length > 0) {
      return NextResponse.json({ insights: res.insights.slice(0, 4), source: "ai" });
    }
    throw new Error("Invalid format from Gemini");
  } catch (err: any) {
    console.warn("Using rule-based insights fallback due to:", err?.message ?? err);
    const fallbackInsights = generateFallbackInsights(summary);
    return NextResponse.json({ insights: fallbackInsights, source: "rules" });
  }
}

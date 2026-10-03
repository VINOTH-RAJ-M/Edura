import { NextRequest, NextResponse } from "next/server";
import { admin, getUser, isStaff } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!isStaff(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = admin();
  const [students, enrollments, payments, tickets] = await Promise.all([
    db.from("profiles").select("id, created_at").eq("role", "student"),
    db.from("enrollments").select("student_id, status, enrolled_at, courses(title)"),
    db.from("payments").select("student_id, amount, status, course_id, courses(title)"),
    db.from("tickets").select("id, ticket_no, subject, category, priority, status, sentiment, escalated, rating, created_at, resolved_at, sla_due_at, departments(name)"),
  ]);

  const t = tickets.data ?? [];
  // Only count real students (admin/staff accounts also get demo rows from the signup trigger)
  const studentIds = new Set((students.data ?? []).map((x) => x.id));
  const e = (enrollments.data ?? []).filter((x) => studentIds.has(x.student_id));
  const pay = (payments.data ?? []).filter((x) => studentIds.has(x.student_id));
  const weekAgo = Date.now() - 7 * 86400_000;
  const open = t.filter((x) => !["Resolved", "Closed"].includes(x.status));
  const done = t.filter((x) => x.resolved_at);
  const avgHours = done.length
    ? done.reduce((s, x) => s + (+new Date(x.resolved_at!) - +new Date(x.created_at)), 0) / done.length / 3600_000
    : 0;

  const count = (arr: Record<string, any>[], key: (x: any) => string) =>
    Object.entries(arr.reduce((m: Record<string, number>, x) => ((m[key(x)] = (m[key(x)] ?? 0) + 1), m), {}))
      .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const rated = t.filter((x) => x.rating);

  // Payment overview breakdown
  const paidPayments = pay.filter((p) => p.status === "paid");
  const pendingPayments = pay.filter((p) => p.status === "pending");
  const failedPayments = pay.filter((p) => p.status === "failed");

  const paidAmount = paidPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingAmount = pendingPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const failedAmount = failedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

  // Revenue by course for paid payments
  const courseRevenueMap: Record<string, { amount: number; count: number }> = {};
  for (const p of paidPayments) {
    const courseTitle = (p.courses as any)?.title || "General / Unassigned";
    if (!courseRevenueMap[courseTitle]) {
      courseRevenueMap[courseTitle] = { amount: 0, count: 0 };
    }
    courseRevenueMap[courseTitle].amount += Number(p.amount || 0);
    courseRevenueMap[courseTitle].count += 1;
  }
  const revenueByCourse = Object.entries(courseRevenueMap)
    .map(([name, data]) => ({ name, amount: data.amount, count: data.count }))
    .sort((a, b) => b.amount - a.amount);

  // 14-day ticket trends (Overall + Category Trend Analysis)
  const topCategories = ["Payment", "Enrollment", "Technical Issue", "Course Content", "Certificate", "Internship", "General"];
  const trendDays: { date: string; fullDate: string; count: number; [key: string]: any }[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayTickets = t.filter((x) => x.created_at && x.created_at.slice(0, 10) === dateStr);

    const dayObj: { date: string; fullDate: string; count: number; [key: string]: any } = {
      date: displayDate,
      fullDate: dateStr,
      count: dayTickets.length,
    };

    for (const cat of topCategories) {
      dayObj[cat] = dayTickets.filter((x) => x.category === cat).length;
    }

    trendDays.push(dayObj);
  }

  // Detailed Satisfaction Breakdown (5★ to 1★, CSAT %, NPS estimation)
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 1, 1: 0 } as Record<number, number>;
  for (const r of rated) {
    if (r.rating && ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    }
  }

  const totalRatings = rated.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars: `${stars} ★`,
    starNum: stars,
    count: ratingCounts[stars] || 0,
    percentage: totalRatings ? Math.round(((ratingCounts[stars] || 0) / totalRatings) * 100) : 0,
  }));

  const satisfiedCount = (ratingCounts[5] || 0) + (ratingCounts[4] || 0);
  const csatPercentage = totalRatings ? Math.round((satisfiedCount / totalRatings) * 100) : 100;
  const promoters = ratingCounts[5] || 0;
  const detractors = (ratingCounts[1] || 0) + (ratingCounts[2] || 0) + (ratingCounts[3] || 0);
  const npsScore = totalRatings ? Math.round(((promoters - detractors) / totalRatings) * 100) : 0;

  // Predictive SLA Breach & Escalation Risks
  const predictiveRisks = open.map((ticket) => {
    const dueTime = ticket.sla_due_at ? +new Date(ticket.sla_due_at) : +new Date(ticket.created_at) + 24 * 3600_000;
    const hoursLeft = Math.round(((dueTime - Date.now()) / 3600_000) * 10) / 10;
    const isNegative = ticket.sentiment === "Frustrated" || ticket.sentiment === "Angry";

    let riskLevel: "Critical" | "High" | "Medium" | "Low" = "Low";
    if (ticket.escalated || hoursLeft <= 0) {
      riskLevel = "Critical";
    } else if (hoursLeft <= 4 || (isNegative && ticket.priority === "High")) {
      riskLevel = "High";
    } else if (hoursLeft <= 12 || isNegative) {
      riskLevel = "Medium";
    }

    return {
      id: ticket.id,
      ticket_no: ticket.ticket_no,
      subject: ticket.subject,
      category: ticket.category,
      department: (ticket.departments as any)?.name ?? "Support",
      priority: ticket.priority,
      sentiment: ticket.sentiment,
      hoursLeft,
      riskLevel,
      recommendation:
        riskLevel === "Critical"
          ? "Immediate supervisor reassignment required"
          : riskLevel === "High"
          ? "Priority reply advised within 60 minutes"
          : "Standard workflow on schedule",
    };
  }).filter((x) => x.riskLevel !== "Low").sort((a, b) => a.hoursLeft - b.hoursLeft).slice(0, 6);

  return NextResponse.json({
    totalStudents: students.data?.length ?? 0,
    activeStudents: new Set(e.filter((x) => x.status === "active").map((x) => x.student_id)).size,
    totalEnrollments: e.length,
    newEnrollments: e.filter((x) => +new Date(x.enrolled_at) > weekAgo).length,
    revenue: paidAmount,
    pendingPayments: pendingPayments.length,
    pendingComplaints: open.length,
    resolvedComplaints: t.length - open.length,
    highPriority: open.filter((x) => x.priority === "High").length,
    escalated: open.filter((x) => x.escalated).length,
    avgResolutionHours: Math.round(avgHours * 10) / 10,
    avgRating: rated.length ? Math.round((rated.reduce((s, x) => s + x.rating!, 0) / rated.length) * 10) / 10 : null,
    byCategory: count(t, (x) => x.category),
    byDepartment: count(t, (x) => x.departments?.name ?? "Unassigned"),
    bySentiment: count(t, (x) => x.sentiment),
    byCourse: count(e, (x) => x.courses?.title ?? "Unknown"),
    paymentsOverview: {
      paid: { count: paidPayments.length, amount: paidAmount },
      pending: { count: pendingPayments.length, amount: pendingAmount },
      failed: { count: failedPayments.length, amount: failedAmount },
      revenueByCourse,
    },
    ticketTrends: trendDays,
    satisfactionAnalysis: {
      avgRating: rated.length ? Math.round((rated.reduce((s, x) => s + x.rating!, 0) / rated.length) * 10) / 10 : null,
      totalRatings,
      csatPercentage,
      npsScore,
      ratingDistribution,
    },
    predictiveRisks,
  });
}


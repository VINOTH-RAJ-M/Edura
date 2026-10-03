import { NextRequest, NextResponse } from "next/server";
import { admin, getUser, isStaff } from "@/lib/supabase-server";
import { classify } from "@/lib/ai/classify";
import { findDuplicate } from "@/lib/ai/duplicates";
import { SLA_HOURS } from "@/lib/types";

// Create a ticket: AI classifies, prioritises, routes to a department and drafts a reply.
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!message || String(message).trim().length < 5)
    return NextResponse.json({ error: "Describe your issue in a few words." }, { status: 400 });

  const db = admin();

  // Context lets the AI judge things like "paid but not enrolled".
  const [{ data: enr }, { data: pay }] = await Promise.all([
    db.from("enrollments").select("status, courses(title)").eq("student_id", user.id),
    db.from("payments").select("status, amount, courses(title)").eq("student_id", user.id),
  ]);
  const context = `Enrollments: ${JSON.stringify(enr)}. Payments: ${JSON.stringify(pay)}`;

  const ai = await classify(message, context);

  const { data: dept } = await db.from("departments").select("id").eq("name", ai.department).single();

  const { data: open } = await db
    .from("tickets").select("id, message").eq("student_id", user.id)
    .not("status", "in", "(Resolved,Closed)");
  const dup = findDuplicate(message, open ?? []);

  const sla = new Date(Date.now() + SLA_HOURS[ai.priority] * 3600_000).toISOString();

  const { data: ticket, error } = await db.from("tickets").insert({
    student_id: user.id,
    subject: subject || ai.summary,
    message,
    category: ai.category,
    priority: ai.priority,
    sentiment: ai.sentiment,
    language: ai.language,
    department_id: dept?.id ?? null,
    suggested_action: ai.suggested_action,
    ai_reply: ai.ai_reply,
    status: "Assigned",
    duplicate_of: dup?.id ?? null,
    sla_due_at: sla,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("ticket_events").insert([
    { ticket_id: ticket.id, actor_id: user.id, event_type: "created", note: "Ticket created by student" },
    { ticket_id: ticket.id, event_type: "status", note: `AI routed to ${ai.department} (${ai.category}, ${ai.priority} priority)` },
  ]);

  return NextResponse.json({ ticket, department: ai.department, duplicate: dup });
}

// List tickets. Students see their own; staff see everything (filterable).
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const db = admin();
  const sp = req.nextUrl.searchParams;
  let q = db.from("tickets").select("*, departments(name), profiles!tickets_student_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  if (!isStaff(user)) q = q.eq("student_id", user.id);
  for (const key of ["status", "priority", "category"] as const) {
    const v = sp.get(key);
    if (v) q = q.eq(key, v);
  }
  const { data, error } = await q.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tickets: data });
}

import { NextRequest, NextResponse } from "next/server";
import { admin, getUser, isStaff } from "@/lib/supabase-server";
import { STATUSES } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const db = admin();
  const { data: ticket } = await db.from("tickets")
    .select("*, departments(name), profiles!tickets_student_id_fkey(full_name, email)").eq("id", id).single();
  if (!ticket || (!isStaff(user) && ticket.student_id !== user.id))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: events } = await db.from("ticket_events").select("*").eq("ticket_id", id).order("created_at");
  return NextResponse.json({ ticket, events });
}

// Staff: change status / add a note / reply. Student: rate a resolved ticket.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const db = admin();
  const { data: ticket } = await db.from("tickets").select("*").eq("id", id).single();
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date().toISOString();

  if (isStaff(user)) {
    const patch: Record<string, unknown> = { updated_at: now };
    if (body.status) {
      if (!(STATUSES as readonly string[]).includes(body.status))
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      patch.status = body.status;
      if (body.status === "Resolved") patch.resolved_at = now;
      if (body.status === "In Progress" && !ticket.assigned_to) patch.assigned_to = user.id;
    }
    const { data, error } = await db.from("tickets").update(patch).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const events = [];
    if (body.status) events.push({ ticket_id: id, actor_id: user.id, event_type: "status", note: `Status changed to ${body.status}` });
    if (body.reply) events.push({ ticket_id: id, actor_id: user.id, event_type: "reply", note: body.reply });
    if (events.length) await db.from("ticket_events").insert(events);
    return NextResponse.json({ ticket: data });
  }

  // Student path
  if (ticket.student_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (typeof body.rating === "number" && ["Resolved", "Closed"].includes(ticket.status)) {
    const { data } = await db.from("tickets")
      .update({ rating: body.rating, feedback: body.feedback ?? null, status: "Closed", updated_at: now })
      .eq("id", id).select().single();
    await db.from("ticket_events").insert({ ticket_id: id, actor_id: user.id, event_type: "status", note: `Student rated ${body.rating}/5 and closed the ticket` });
    return NextResponse.json({ ticket: data });
  }
  if (body.note) {
    await db.from("ticket_events").insert({ ticket_id: id, actor_id: user.id, event_type: "note", note: body.note });
    await db.from("tickets").update({ updated_at: now, status: ticket.status === "Waiting" ? "In Progress" : ticket.status }).eq("id", id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}

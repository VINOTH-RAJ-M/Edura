import { NextRequest, NextResponse } from "next/server";
import { admin, getUser, isStaff } from "@/lib/supabase-server";

// Auto-escalation: unresolved tickets past their SLA are flagged and bumped to High.
// Called by Vercel Cron (Bearer CRON_SECRET) or by the "Run escalation" button for staff.
export async function GET(req: NextRequest) {
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronOk = !!process.env.CRON_SECRET && bearer === process.env.CRON_SECRET;
  if (!cronOk && !isStaff(await getUser(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = admin();
  const { data: late } = await db.from("tickets").select("id, ticket_no")
    .not("status", "in", "(Resolved,Closed)").eq("escalated", false).lt("sla_due_at", new Date().toISOString());

  for (const t of late ?? []) {
    await db.from("tickets").update({ escalated: true, priority: "High", updated_at: new Date().toISOString() }).eq("id", t.id);
    await db.from("ticket_events").insert({ ticket_id: t.id, event_type: "escalated", note: "SLA breached. Auto-escalated to High priority." });
  }
  return NextResponse.json({ escalated: late?.length ?? 0 });
}
export const POST = GET;

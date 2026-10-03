import { NextRequest, NextResponse } from "next/server";
import { admin, getUser } from "@/lib/supabase-server";
import { chatReply } from "@/lib/ai/chat";

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const db = admin();
  const [enr, pay, cert, tix, ann] = await Promise.all([
    db.from("enrollments").select("status, progress, attendance, courses(title, schedule)").eq("student_id", user.id),
    db.from("payments").select("status, amount, paid_at, courses(title)").eq("student_id", user.id),
    db.from("certificates").select("issued_at, courses(title)").eq("student_id", user.id),
    db.from("tickets").select("ticket_no, subject, status, priority").eq("student_id", user.id).limit(10),
    db.from("announcements").select("title, body").order("created_at", { ascending: false }).limit(3),
  ]);
  const ctx = JSON.stringify({ student: user.name, enrollments: enr.data, payments: pay.data, certificates: cert.data, tickets: tix.data, announcements: ann.data });
  return NextResponse.json(await chatReply(message, ctx));
}

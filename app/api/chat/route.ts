import { NextRequest, NextResponse } from "next/server";
import { admin, getUser } from "@/lib/supabase-server";
import { chatReply } from "@/lib/ai/chat";

export async function POST(req: NextRequest) {
  let message = "";
  try {
    const body = await req.json();
    message = body?.message || "";
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const user = await getUser(req);
  const db = admin();
  let ctx = "";

  if (user) {
    const [enr, pay, cert, tix, ann] = await Promise.all([
      db.from("enrollments").select("status, progress, attendance, courses(title, schedule)").eq("student_id", user.id),
      db.from("payments").select("status, amount, paid_at, courses(title)").eq("student_id", user.id),
      db.from("certificates").select("issued_at, courses(title)").eq("student_id", user.id),
      db.from("tickets").select("ticket_no, subject, status, priority").eq("student_id", user.id).limit(10),
      db.from("announcements").select("title, body").order("created_at", { ascending: false }).limit(3),
    ]);
    ctx = JSON.stringify({
      student: user.name,
      enrollments: enr.data ?? [],
      payments: pay.data ?? [],
      certificates: cert.data ?? [],
      tickets: tix.data ?? [],
      announcements: ann.data ?? [],
    });
  } else {
    const [courses, ann, internships] = await Promise.all([
      db.from("courses").select("title, description, instructor, schedule").limit(5),
      db.from("announcements").select("title, body").order("created_at", { ascending: false }).limit(3),
      db.from("internships").select("role, company, location").limit(3),
    ]);
    ctx = JSON.stringify({
      guest: true,
      availableCourses: courses.data ?? [],
      announcements: ann.data ?? [],
      internships: internships.data ?? [],
    });
  }

  const result = await chatReply(message, ctx);
  return NextResponse.json(result);
}

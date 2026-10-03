// Demo data for NEXORA judges: 14 students, enrollments, payments, certificates and 26 tickets with timelines.
// Everything is tagged by the demo email domain so `--reset` removes only demo data.

export const DEMO_DOMAIN = "demo.skillonex.test";
export const DEMO_PASSWORD = "Demo@12345";

const STUDENTS = [
  "Arun Kumar", "Priya Lakshmi", "Karthik Raja", "Divya Bharathi", "Mohammed Irfan",
  "Sneha Reddy", "Vignesh Subramanian", "Ananya Iyer", "Harish Narayanan", "Meenakshi Sundaram",
  "Rahul Verma", "Lavanya Prakash", "Suresh Babu", "Nandhini Devi",
];

const PRICE = { 1: 4999, 2: 7999, 3: 6999, 4: 5499 }; // by course id (order of schema seed)

// course ids per student (first = main course). status: a=active, c=completed, p=pending (paid, not enrolled yet)
const PLAN = [
  [[1, "p"], [3, "a"]], [[3, "c"], [1, "a"]], [[2, "a"]], [[1, "a"], [4, "a"]], [[4, "a"], [2, "a"]],
  [[2, "p"]], [[1, "a"]], [[1, "c"], [3, "a"]], [[2, "a"], [1, "a"]], [[3, "a"], [4, "c"]],
  [[3, "a"], [2, "a"]], [[2, "a"]], [[1, "a"], [2, "a"]], [[4, "a"]],
];

const CATEGORY_DEPARTMENT = {
  Payment: "Accounts", Enrollment: "Admissions", "Course Content": "Academics", Certificate: "Certification",
  "Technical Issue": "Technical Support", Internship: "Placement & Internships", Attendance: "Academics", General: "General Support",
};
const SLA_HOURS = { High: 4, Medium: 24, Low: 72 };

const AI_REPLY = {
  Payment: "Thanks for letting us know. Your payment details are with our Accounts team and they will verify it. You can track progress on this ticket.",
  Enrollment: "Thanks for reaching out. Our Admissions team will check your payment and update your enrollment. You will see the status here.",
  "Course Content": "Thanks for your message. Our Academics team will review this and reply on this ticket.",
  Certificate: "Thanks for asking. The Certification team has your request and will update this ticket.",
  "Technical Issue": "Sorry about the trouble. Our Technical Support team is looking into it and will reply here.",
  Internship: "Thanks for your interest. The Placement team will guide you on this ticket.",
  Attendance: "Thanks for flagging this. The Academics team will check the attendance records.",
  General: "Thank you for your message. Our team will respond on this ticket.",
};
const ACTION = {
  Payment: "Verify the payment in the gateway and update the student's record.",
  Enrollment: "Verify payment and update enrollment.",
  "Course Content": "Share the requested material or answer the question.",
  Certificate: "Check completion status and issue or correct the certificate.",
  "Technical Issue": "Reproduce the issue and fix or share a workaround.",
  Internship: "Share application steps for the listed internship.",
  Attendance: "Cross-check class logs and correct attendance if needed.",
  General: "Reply to the student.",
};
const STAFF_REPLY = {
  Payment: "We have verified the payment and updated your account. Please check your dashboard.",
  Enrollment: "Your enrollment is now active. You can open the course from your dashboard.",
  "Course Content": "We have shared the details on your dashboard. Let us know if you need anything else.",
  Certificate: "Your certificate has been issued. You can download it from the dashboard.",
  "Technical Issue": "This is fixed now. Please sign in again and let us know if it continues.",
  Internship: "Please apply through the internship card on your dashboard. We have sent the steps.",
  Attendance: "Your attendance has been corrected.",
  General: "Thank you for the feedback. We have noted it.",
};

// s = student index, age = hours since created, res = hours it took to resolve
const TICKETS = [
  // ---- open ----
  { s: 0, cat: "Payment", pri: "High", sent: "Frustrated", lang: "English", status: "Assigned", age: 2,
    subj: "Paid but enrollment not showing", msg: "I paid for the Data Analytics course yesterday, but my enrollment is still not showing." },
  { s: 5, cat: "Enrollment", pri: "High", sent: "Frustrated", lang: "Tanglish", status: "In Progress", age: 3,
    subj: "Full Stack course not unlocked", msg: "Payment panniten but Full Stack course unlock aagala. Please help urgently." },
  { s: 8, cat: "Technical Issue", pri: "High", sent: "Frustrated", lang: "English", status: "Assigned", age: 1,
    subj: "Cannot sign in, OTP missing", msg: "Cannot login since morning, OTP is not coming. I have an assignment deadline tomorrow." },
  { s: 4, cat: "Payment", pri: "High", sent: "Angry", lang: "English", status: "In Progress", age: 9, esc: true,
    subj: "Charged twice for UI/UX", msg: "My money got deducted twice for the UI/UX course. This is ridiculous, I want a refund." },
  { s: 9, cat: "Certificate", pri: "High", sent: "Neutral", lang: "Tanglish", status: "Assigned", age: 30, esc: true,
    subj: "Name spelled wrong on certificate", msg: "Certificate-la en peyar thappa irukku. Spelling correct pannanum." },
  { s: 2, cat: "Technical Issue", pri: "Medium", sent: "Frustrated", lang: "English", status: "In Progress", age: 6,
    subj: "Live class link not opening", msg: "Live class link is not opening, it shows an error every time." },
  { s: 1, cat: "Certificate", pri: "Medium", sent: "Neutral", lang: "English", status: "Waiting", age: 10,
    subj: "Certificate not downloadable", msg: "My certificate for Machine Learning Foundations is not available for download." },
  { s: 6, cat: "Attendance", pri: "Medium", sent: "Frustrated", lang: "English", status: "Assigned", age: 15,
    subj: "Attendance shows 60%", msg: "My attendance shows 60% but I attended all classes this month." },
  { s: 12, cat: "Course Content", pri: "Medium", sent: "Neutral", lang: "Tanglish", status: "Waiting", age: 12,
    subj: "Assignment deadline extension", msg: "Assignment 2 deadline extension kidaikkuma? Internet issue irundhuchu." },
  { s: 10, cat: "Technical Issue", pri: "Medium", sent: "Frustrated", lang: "English", status: "In Progress", age: 14,
    subj: "Progress bar stuck at 35%", msg: "Dashboard progress bar is stuck at 35% even after finishing the module." },
  { s: 7, cat: "Certificate", pri: "Medium", sent: "Neutral", lang: "English", status: "New", age: 2,
    subj: "Bonafide certificate request", msg: "Need a bonafide certificate for my college." },
  { s: 3, cat: "Course Content", pri: "Low", sent: "Positive", lang: "English", status: "Assigned", age: 20,
    subj: "SQL workbook for week 3", msg: "Can you share the SQL practice workbook for week 3? The lectures were really helpful." },
  { s: 7, cat: "Internship", pri: "Low", sent: "Neutral", lang: "English", status: "Assigned", age: 30,
    subj: "How to apply for internship", msg: "How do I apply for the Data Analyst internship listed on the dashboard?" },
  { s: 11, cat: "General", pri: "Low", sent: "Neutral", lang: "English", status: "Assigned", age: 5,
    subj: "Change registered phone number", msg: "Can I change my registered phone number?" },
  // ---- resolved (waiting for student rating) ----
  { s: 2, cat: "Attendance", pri: "Medium", sent: "Neutral", lang: "English", status: "Resolved", age: 50, res: 10,
    subj: "Attendance correction", msg: "Please correct my attendance for 12th, I was present." },
  { s: 3, cat: "Internship", pri: "Low", sent: "Positive", lang: "English", status: "Resolved", age: 70, res: 6,
    subj: "Applying to two internships", msg: "Thanks for the internship list. Can I apply for two roles?" },
  { s: 9, cat: "Payment", pri: "Medium", sent: "Frustrated", lang: "Tanglish", status: "Resolved", age: 40, res: 12,
    subj: "Installment option", msg: "Fee installment option irukka? Full amount pay panna mudiyala." },
  // ---- closed with rating ----
  { s: 10, cat: "Payment", pri: "Medium", sent: "Neutral", lang: "English", status: "Closed", age: 150, res: 5, rating: 5,
    subj: "Invoice request", msg: "Please send the invoice for my Machine Learning course payment." },
  { s: 11, cat: "Enrollment", pri: "High", sent: "Frustrated", lang: "English", status: "Closed", age: 200, res: 2, rating: 4,
    subj: "Course missing after payment", msg: "I paid for the Full Stack course but it is not showing in my dashboard." },
  { s: 12, cat: "Technical Issue", pri: "Medium", sent: "Neutral", lang: "English", status: "Closed", age: 120, res: 20, rating: 4,
    subj: "Video buffering on mobile", msg: "Video lectures keep buffering on mobile." },
  { s: 13, cat: "Course Content", pri: "Low", sent: "Positive", lang: "English", status: "Closed", age: 100, res: 8, rating: 5,
    subj: "Recording of missed class", msg: "Is there a recording available for the missed Friday class?" },
  { s: 0, cat: "Certificate", pri: "Low", sent: "Neutral", lang: "English", status: "Closed", age: 300, res: 3, rating: 5,
    subj: "Certificate timeline", msg: "When will the September batch certificates be issued?" },
  { s: 1, cat: "Payment", pri: "High", sent: "Angry", lang: "English", status: "Closed", age: 260, res: 28, rating: 3,
    subj: "Payment failed but debited", msg: "Payment failed but amount debited. Worst experience, fix this now!" },
  { s: 4, cat: "Enrollment", pri: "Medium", sent: "Neutral", lang: "English", status: "Closed", age: 180, res: 15, rating: 4,
    subj: "Switch course request", msg: "I want to switch from UI/UX Design to Data Analytics. Is it possible?" },
  { s: 6, cat: "General", pri: "Low", sent: "Positive", lang: "English", status: "Closed", age: 90, res: 40, rating: 5,
    subj: "Dark mode suggestion", msg: "Dark mode for the dashboard would be great." },
  { s: 8, cat: "General", pri: "Low", sent: "Positive", lang: "English", status: "Closed", age: 140, res: 2, rating: 5,
    subj: "Thank you", msg: "Great course, the instructor explains very well. Thank you!" },
];

// small deterministic random so every seed run looks the same
let seedState = 42;
const rnd = () => ((seedState = (seedState * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const must = (r, what) => { if (r.error) throw new Error(`${what}: ${r.error.message}`); return r.data; };

export async function seed(db, { reset = false } = {}) {
  const log = (m) => console.log(m);

  // ---- existing demo users ----
  const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = (list?.users ?? []).filter((u) => u.email?.endsWith(`@${DEMO_DOMAIN}`));

  if (existing.length && !reset) {
    log(`Demo data already exists (${existing.length} students). Run "npm run seed:reset" to rebuild it.`);
    return;
  }
  if (existing.length) {
    log(`Removing ${existing.length} old demo students (their tickets and enrollments go with them)...`);
    for (const u of existing) await db.auth.admin.deleteUser(u.id);
  }

  // ---- lookups ----
  const depts = Object.fromEntries(must(await db.from("departments").select("id, name"), "departments").map((d) => [d.name, d.id]));
  const courses = must(await db.from("courses").select("id, title").order("id"), "courses");
  if (courses.length < 4) throw new Error("Run supabase/schema.sql first (courses table is empty).");
  const courseId = (n) => courses[n - 1].id; // PLAN uses 1..4
  const adminRow = must(await db.from("profiles").select("id").in("role", ["admin", "staff"]).limit(1), "admin lookup");
  const staffId = adminRow[0]?.id ?? null;
  if (!staffId) log("Note: no admin account found, so staff replies will show without a name. Make yourself admin and re-run seed:reset if you want them.");

  // ---- students ----
  const students = [];
  for (let i = 0; i < STUDENTS.length; i++) {
    const name = STUDENTS[i];
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@${DEMO_DOMAIN}`;
    const res = await db.auth.admin.createUser({ email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { full_name: name } });
    if (res.error) throw new Error(`createUser ${email}: ${res.error.message}`);
    students.push({ id: res.data.user.id, name, email });
  }
  log(`Created ${students.length} students.`);

  // signup trigger already added 2 default enrollments/payments each; replace with varied data
  const ids = students.map((s) => s.id);
  must(await db.from("enrollments").delete().in("student_id", ids), "clear enrollments");
  must(await db.from("payments").delete().in("student_id", ids), "clear payments");

  const enrollments = [], payments = [], certificates = [];
  students.forEach((st, i) => {
    PLAN[i].forEach(([c, kind], j) => {
      // first 6 students enrolled this week (feeds "New this week"), others spread over the last month
      const enrolledH = i < 6 ? 12 + Math.floor(rnd() * 140) : 200 + Math.floor(rnd() * 500);
      const status = kind === "a" ? "active" : kind === "c" ? "completed" : "pending";
      const progress = kind === "c" ? 100 : kind === "p" ? 0 : 20 + Math.floor(rnd() * 70);
      enrollments.push({
        student_id: st.id, course_id: courseId(c), status, progress,
        attendance: kind === "p" ? 0 : 72 + Math.floor(rnd() * 26), enrolled_at: hoursAgo(enrolledH),
      });
      payments.push({ student_id: st.id, course_id: courseId(c), amount: PRICE[c], status: "paid", paid_at: hoursAgo(enrolledH + 1) });
      if (kind === "c") certificates.push({ student_id: st.id, course_id: courseId(c), issued_at: hoursAgo(24 * 3) });
    });
  });
  // a couple of money problems for the "Pending payments" widget
  payments.push({ student_id: students[11].id, course_id: courseId(1), amount: PRICE[1], status: "pending", paid_at: hoursAgo(20) });
  payments.push({ student_id: students[13].id, course_id: courseId(3), amount: PRICE[3], status: "pending", paid_at: hoursAgo(30) });

  must(await db.from("enrollments").insert(enrollments), "enrollments");
  must(await db.from("payments").insert(payments), "payments");
  if (certificates.length) must(await db.from("certificates").insert(certificates), "certificates");
  log(`Added ${enrollments.length} enrollments, ${payments.length} payments, ${certificates.length} certificates.`);

  // ---- tickets ----
  let n = 0;
  for (const t of TICKETS) {
    const st = students[t.s];
    const created = hoursAgo(t.age);
    const resolvedAt = t.res ? hoursAgo(t.age - t.res) : null;
    const dept = CATEGORY_DEPARTMENT[t.cat];
    const row = must(await db.from("tickets").insert({
      student_id: st.id, subject: t.subj, message: t.msg, category: t.cat, priority: t.pri,
      sentiment: t.sent, language: t.lang, department_id: depts[dept] ?? null,
      suggested_action: ACTION[t.cat], ai_reply: AI_REPLY[t.cat], status: t.status,
      escalated: !!t.esc, sla_due_at: new Date(+new Date(created) + SLA_HOURS[t.pri] * 3600_000).toISOString(),
      rating: t.rating ?? null, created_at: created, updated_at: resolvedAt ?? hoursAgo(Math.max(t.age - 1, 0.2)),
      resolved_at: ["Resolved", "Closed"].includes(t.status) ? resolvedAt : null,
    }).select("id").single(), "ticket");

    // timeline
    const span = t.res ?? Math.min(t.age, 8);
    const at = (frac) => hoursAgo(t.age - span * frac);
    const ev = [
      { ticket_id: row.id, actor_id: st.id, event_type: "created", note: "Ticket created by student", created_at: created },
      { ticket_id: row.id, event_type: "status", note: `AI routed to ${dept} (${t.cat}, ${t.pri} priority)`, created_at: at(0.02) },
    ];
    if (["In Progress", "Waiting", "Resolved", "Closed"].includes(t.status))
      ev.push({ ticket_id: row.id, actor_id: staffId, event_type: "status", note: "Status changed to In Progress", created_at: at(0.3) });
    if (t.status === "Waiting")
      ev.push({ ticket_id: row.id, actor_id: staffId, event_type: "status", note: "Status changed to Waiting", created_at: at(0.6) });
    if (["Resolved", "Closed"].includes(t.status)) {
      ev.push({ ticket_id: row.id, actor_id: staffId, event_type: "reply", note: STAFF_REPLY[t.cat], created_at: at(0.85) });
      ev.push({ ticket_id: row.id, actor_id: staffId, event_type: "status", note: "Status changed to Resolved", created_at: at(1) });
    }
    if (t.status === "Closed")
      ev.push({ ticket_id: row.id, actor_id: st.id, event_type: "status", note: `Student rated ${t.rating}/5 and closed the ticket`, created_at: hoursAgo(Math.max(t.age - span - 1, 0.1)) });
    if (t.esc)
      ev.push({ ticket_id: row.id, event_type: "escalated", note: "SLA breached. Auto-escalated to High priority.", created_at: hoursAgo(1) });
    must(await db.from("ticket_events").insert(ev), "ticket events");
    n++;
  }
  log(`Added ${n} tickets with timelines.`);
  log(`\nDone. Demo student login: ${students[0].email} / ${DEMO_PASSWORD}`);
}

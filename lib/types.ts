export const STATUSES = ["New", "Assigned", "In Progress", "Waiting", "Resolved", "Closed"] as const;
export type Status = (typeof STATUSES)[number];
export type Priority = "High" | "Medium" | "Low";

export const CATEGORIES = [
  "Payment", "Enrollment", "Course Content", "Certificate",
  "Technical Issue", "Internship", "Attendance", "General",
] as const;

// category -> department name (must match rows in `departments`)
export const CATEGORY_DEPARTMENT: Record<string, string> = {
  Payment: "Accounts",
  Enrollment: "Admissions",
  "Course Content": "Academics",
  Certificate: "Certification",
  "Technical Issue": "Technical Support",
  Internship: "Placement & Internships",
  Attendance: "Academics",
  General: "General Support",
};

export type Classification = {
  category: string;
  priority: Priority;
  sentiment: "Positive" | "Neutral" | "Frustrated" | "Angry";
  language: string;
  department: string;
  suggested_action: string;
  ai_reply: string;
  summary: string;
};

export type Ticket = {
  id: string;
  ticket_no: string;
  student_id: string;
  subject: string | null;
  message: string;
  category: string;
  priority: Priority;
  sentiment: string;
  language: string;
  department_id: number | null;
  suggested_action: string | null;
  ai_reply: string | null;
  status: Status;
  escalated: boolean;
  duplicate_of: string | null;
  sla_due_at: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

// Hours before an unresolved ticket is auto-escalated.
export const SLA_HOURS: Record<Priority, number> = { High: 4, Medium: 24, Low: 72 };

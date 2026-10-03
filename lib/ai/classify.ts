import { callGeminiJSON } from "./gemini";
import { CATEGORIES, CATEGORY_DEPARTMENT, Classification, Priority } from "../types";

const SYSTEM = `You are the support triage engine for Skillonex Academy, an online learning academy.
Read the student's message (it may be English, Tamil, Tanglish or mixed) and return ONLY JSON:
{
  "category": one of ${JSON.stringify(CATEGORIES)},
  "priority": "High" | "Medium" | "Low",
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Angry",
  "language": "language the student wrote in",
  "suggested_action": "one short instruction for the staff member",
  "ai_reply": "a warm 2-3 sentence reply to the student, in the student's language, saying what happens next. Never promise refunds or dates.",
  "summary": "max 12 words"
}
Priority rules: High = money paid but service missing, cannot access a paid course, exam/deadline within days, angry tone.
Medium = needs action but not blocking. Low = information questions and feedback.`;

/** Main entry. Uses Gemini when a key is set, otherwise a keyword fallback so the demo never breaks. */
export async function classify(message: string, context = ""): Promise<Classification> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await classifyWithGemini(message, context);
    } catch (e) {
      console.error("Gemini failed, using fallback:", e);
    }
  }
  return classifyFallback(message);
}

async function classifyWithGemini(message: string, context: string): Promise<Classification> {
  const out = await callGeminiJSON(SYSTEM, `${context ? `Student context: ${context}\n` : ""}Message: ${message}`, 0.2);

  const category = (CATEGORIES as readonly string[]).includes(out.category) ? out.category : "General";
  const priority: Priority = ["High", "Medium", "Low"].includes(out.priority) ? out.priority : "Medium";
  return {
    category,
    priority,
    sentiment: out.sentiment ?? "Neutral",
    language: out.language ?? "English",
    department: CATEGORY_DEPARTMENT[category],
    suggested_action: out.suggested_action ?? "Review and respond to the student.",
    ai_reply: out.ai_reply ?? "Thanks for reaching out. Our team has your request and will update you here.",
    summary: out.summary ?? message.slice(0, 80),
  };
}

const RULES: [string, RegExp][] = [
  ["Payment", /pay|paid|refund|invoice|fee|amount|transaction|upi|card|panam|kaasu/i],
  ["Certificate", /certificate|cert\b|completion letter/i],
  ["Enrollment", /enrol|enroll|admission|not showing|not unlocked|access to (the )?course|join/i],
  ["Technical Issue", /login|password|error|bug|not loading|crash|video|link not|otp|cannot open/i],
  ["Internship", /intern|placement|job|resume/i],
  ["Attendance", /attendance|absent|missed class/i],
  ["Course Content", /course|class|lecture|assignment|material|instructor|syllabus|schedule/i],
];

export function classifyFallback(message: string): Classification {
  const category = RULES.find(([, re]) => re.test(message))?.[0] ?? "General";
  const angry = /worst|useless|fraud|scam|ridiculous|pathetic|angry/i.test(message);
  const urgent = /urgent|asap|immediately|yesterday|still not|not showing|deadline|exam|tomorrow/i.test(message);
  const paidProblem = category === "Payment" || (category === "Enrollment" && /paid|payment/i.test(message));
  const priority: Priority = angry || (urgent && paidProblem) ? "High" : urgent || paidProblem ? "Medium" : "Low";
  return {
    category,
    priority,
    sentiment: angry ? "Angry" : urgent ? "Frustrated" : "Neutral",
    language: /[\u0B80-\u0BFF]/.test(message) ? "Tamil" : "English",
    department: CATEGORY_DEPARTMENT[category],
    suggested_action: `Review the ${category.toLowerCase()} request and reply to the student.`,
    ai_reply: "Thanks for reaching out. Your request is logged and routed to the right team. You can follow its status on this page.",
    summary: message.slice(0, 80),
  };
}

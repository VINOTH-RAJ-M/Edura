import { callGeminiJSON } from "./gemini";

/** Student-facing assistant. Answers from the student's own data; suggests raising a ticket otherwise. */
export async function chatReply(question: string, studentContext: string): Promise<{ reply: string; suggestTicket: boolean; debug?: string }> {
  const system = `You are the Skillonex Academy support assistant. Answer using ONLY the student data below.
If the answer is not in the data or needs a human (refunds, payment problems, access fixes), say so briefly and set suggestTicket true.
Reply in the language the student uses. Keep it under 70 words. Return JSON: {"reply": string, "suggestTicket": boolean}.

STUDENT DATA:
${studentContext}`;
  try {
    const out = await callGeminiJSON<{ reply?: string; suggestTicket?: boolean }>(system, question, 0.3);
    return { reply: out.reply ?? "I could not form an answer. Please raise a ticket.", suggestTicket: !!out.suggestTicket };
  } catch (e: any) {
    // The message below shows in the chat so you can see the real cause while developing.
    return {
      reply: "The AI service is not responding right now. Please raise a ticket and the team will help.",
      suggestTicket: true,
      debug: process.env.NODE_ENV !== "production" ? String(e?.message ?? e) : undefined,
    };
  }
}

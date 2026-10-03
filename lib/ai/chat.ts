import { callGeminiJSON } from "./gemini";

/** Student-facing assistant. Answers from student data and academy knowledge. */
export async function chatReply(
  question: string,
  studentContext: string
): Promise<{ reply: string; suggestTicket: boolean; debug?: string }> {
  const system = `You are Edura / Skillonex Academy's AI Support Assistant.
Answer the user's question helpfully using the context provided below.
- If the user asks about their personal payments, course progress, attendance, or certificates, answer using their specific records in the data.
- If the student writes in Tamil or Tanglish, reply warmly in Tamil/Tanglish. If in English, reply in English.
- If the request requires human intervention (refund approvals, password resets, payment failures), advise them to raise a ticket and set suggestTicket to true.
- Keep the response concise, clear, and polite (under 80 words).
- ALWAYS return valid JSON matching: {"reply": string, "suggestTicket": boolean}

DATA CONTEXT:
${studentContext}`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const out = await callGeminiJSON<{ reply?: string; suggestTicket?: boolean }>(
        system,
        question,
        0.3
      );
      if (out?.reply) {
        return { reply: out.reply, suggestTicket: !!out.suggestTicket };
      }
    } catch (e: any) {
      console.error("Gemini chatReply error:", e);
    }
  }

  // Smart fallback when AI key is unavailable or during network hiccups
  return fallbackChatReply(question, studentContext);
}

function fallbackChatReply(question: string, studentContext: string): { reply: string; suggestTicket: boolean } {
  const q = question.toLowerCase();
  let ctx: any = {};
  try {
    ctx = JSON.parse(studentContext);
  } catch {}

  const isTamil = /[\u0B80-\u0BFF]/.test(question) || /vanakkam|enna|epdi|panam|kaasu|illai|varala/.test(q);

  if (q.includes("payment") || q.includes("fee") || q.includes("pay") || q.includes("panam")) {
    const paidCount = ctx?.payments?.filter((p: any) => p.status === "paid").length ?? 0;
    if (paidCount > 0) {
      return {
        reply: isTamil
          ? `உங்கள் கட்டணம் வெற்றிகரமாக பெறப்பட்டது (${paidCount} பரிவர்த்தனை(கள்)). ஏதேனும் சிக்கல் இருந்தால் புதிய Ticket உருவாக்கவும்.`
          : `We found ${paidCount} verified payment record(s) on your account. If you have any billing discrepancies, please raise an official ticket.`,
        suggestTicket: false,
      };
    }
    return {
      reply: isTamil
        ? "உங்கள் கட்டண விவரங்களை சரிபார்க்க support ticket ஒன்றை உருவாக்கவும்."
        : "To check payment receipts or resolve fee issues, please raise an official ticket and our accounts team will assist.",
      suggestTicket: true,
    };
  }

  if (q.includes("certificate") || q.includes("cert")) {
    return {
      reply: isTamil
        ? "பாடத்திட்டத்தை 100% முடித்ததும் உங்கள் Certificate தானாகவே Unlock ஆகும். Dashboard-ல் 'Payments & Certificates' பகுதியில் பார்க்கலாம்."
        : "Certificates unlock automatically once you complete 100% of your course progress. You can view sample previews and download credentials under 'Payments & Certificates'.",
      suggestTicket: false,
    };
  }

  if (q.includes("lms") || q.includes("login") || q.includes("access") || q.includes("password")) {
    return {
      reply: isTamil
        ? "LMS அல்லது கணக்கு அணுகல் பிரச்சனைகளுக்கு எங்கள் தொழில்நுட்பக் குழு உதவ ஒரு Support Ticket-ஐ பதிவிடவும்."
        : "For LMS portal access or login issues, please raise an official ticket so our Technical Support team can assist you directly.",
      suggestTicket: true,
    };
  }

  if (q.includes("internship") || q.includes("job") || q.includes("placement")) {
    return {
      reply: isTamil
        ? "Student Dashboard-ல் 'Opportunities' பகுதியில் உள்ள புதிய Internship வாய்ப்புகளைப் பார்த்து உடனே விண்ணப்பிக்கலாம்."
        : "Explore verified industry openings in the 'Opportunities' tab on your dashboard and apply directly via support.",
      suggestTicket: false,
    };
  }

  return {
    reply: isTamil
      ? "வணக்கம்! உங்கள் படிப்புகள், கட்டணங்கள், சான்றிதழ்கள் மற்றும் இன்டர்ன்ஷிப் பற்றி கேட்கலாம் அல்லது புதிய Ticket உருவாக்கலாம்."
      : "Hello! I am your AI Support Assistant. Ask me about your enrolled courses, payments, certificates, or raise an official support ticket.",
    suggestTicket: false,
  };
}

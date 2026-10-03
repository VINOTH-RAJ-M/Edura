// One place that talks to Gemini. Tries several models and logs the real error in the server terminal.
const FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-2.5-flash"];

export async function callGeminiJSON<T = any>(system: string, user: string, temperature = 0.2): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const models = [process.env.GEMINI_MODEL, ...FALLBACK_MODELS].filter((m, i, a): m is string => !!m && a.indexOf(m) === i);
  let lastError = "";

  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { responseMimeType: "application/json", temperature },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        lastError = `[${model}] ${res.status}: ${json?.error?.message ?? JSON.stringify(json)}`;
        console.error("Gemini error", lastError);
        continue; // try next model
      }
      const parts = json.candidates?.[0]?.content?.parts ?? [];
      const text: string = parts.map((p: any) => p.text ?? "").join("");
      if (!text) {
        lastError = `[${model}] empty response (${json.candidates?.[0]?.finishReason ?? json.promptFeedback?.blockReason ?? "unknown"})`;
        console.error("Gemini error", lastError);
        continue;
      }
      return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
    } catch (e: any) {
      lastError = `[${model}] ${e?.message ?? e}`;
      console.error("Gemini error", lastError);
    }
  }
  throw new Error(lastError || "Gemini failed");
}

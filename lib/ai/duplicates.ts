// Cheap duplicate detection (token overlap). Swap for pgvector embeddings if time allows.
const tokens = (s: string) =>
  new Set(s.toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF\s]/g, " ").split(/\s+/).filter((w) => w.length > 2));

export function similarity(a: string, b: string): number {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let common = 0;
  A.forEach((w) => B.has(w) && common++);
  return common / (A.size + B.size - common);
}

export function findDuplicate(message: string, open: { id: string; message: string }[], threshold = 0.5) {
  let best: { id: string; score: number } | null = null;
  for (const t of open) {
    const score = similarity(message, t.message);
    if (score >= threshold && (!best || score > best.score)) best = { id: t.id, score };
  }
  return best;
}

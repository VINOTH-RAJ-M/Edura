const tone: Record<string, string> = {
  High: "bg-alert-soft/80 text-alert border-alert/20",
  Medium: "bg-amber-soft/80 text-amber border-amber/20",
  Low: "bg-gold-soft text-gold-dark border-gold/30",
  New: "bg-ink text-gold border-gold/30 font-bold",
  Assigned: "bg-gold-soft text-gold-dark border-gold/30 font-semibold",
  "In Progress": "bg-amber-soft text-amber border-amber/20",
  Waiting: "bg-ink/5 text-ink/80 border-ink/10",
  Resolved: "bg-ok-soft text-ok border-ok/20",
  Closed: "bg-ink text-white border-transparent",
};

const dotColors: Record<string, string> = {
  High: "bg-alert",
  Medium: "bg-amber",
  Low: "bg-gold",
  New: "bg-gold",
  Assigned: "bg-gold",
  "In Progress": "bg-amber",
  Waiting: "bg-ink/40",
  Resolved: "bg-ok",
  Closed: "bg-white",
};

export function Badge({ children }: { children: string }) {
  const isColored = tone[children];
  const dotColor = dotColors[children];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${
        isColored ?? "bg-ink/5 text-ink/75 border-ink/10"
      }`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span>{children}</span>
    </span>
  );
}

export const fmt = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";


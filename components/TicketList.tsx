"use client";
import Link from "next/link";
import { Badge, fmt } from "./Badges";

export default function TicketList({
  tickets,
  base,
  showStudent,
}: {
  tickets: any[];
  base: string;
  showStudent?: boolean;
}) {
  if (!tickets.length) {
    return (
      <div className="panel p-12 text-center mt-5 bg-white space-y-3">
        <div className="w-12 h-12 rounded-full bg-teal-soft/50 text-teal flex items-center justify-center mx-auto text-xl">
          🎫
        </div>
        <h3 className="font-semibold text-ink text-base">No support tickets found</h3>
        <p className="text-sm text-ink/60 max-w-sm mx-auto">
          No tickets match your active filter criteria or you haven&apos;t raised any tickets yet.
        </p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden mt-5 bg-white border border-ink/10 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-[11px] font-bold uppercase tracking-wider text-ink/50 bg-paper/80 border-b border-ink/10">
            <tr>
              <th className="py-3 px-4">Ticket</th>
              {showStudent && <th className="py-3 px-4">Student</th>}
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {tickets.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-paper/60 transition-colors group"
              >
                <td className="py-3.5 px-4">
                  <Link
                    href={`${base}/${t.id}`}
                    className="font-bold text-teal group-hover:text-teal-dark hover:underline flex items-center gap-1.5"
                  >
                    <span>{t.ticket_no}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                  </Link>
                  <div className="text-xs text-ink/70 font-medium max-w-xs md:max-w-sm truncate mt-0.5">
                    {t.subject || t.message?.slice(0, 40)}
                  </div>
                </td>

                {showStudent && (
                  <td className="py-3.5 px-4 text-ink/80 font-medium">
                    <div>{t.profiles?.full_name || "Student"}</div>
                    <div className="text-[11px] text-ink/50">{t.profiles?.email}</div>
                  </td>
                )}

                <td className="py-3.5 px-4 text-ink/75 font-medium">
                  {t.category || "General"}
                </td>

                <td className="py-3.5 px-4 text-ink/75">
                  <span className="px-2 py-0.5 rounded bg-ink/5 text-xs text-ink/70">
                    {t.departments?.name || "Unassigned"}
                  </span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Badge>{t.priority}</Badge>
                    {t.escalated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-alert-soft text-alert border border-alert/20 animate-pulse">
                        <span>🔥</span>
                        <span>ESCALATED</span>
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge>{t.status}</Badge>
                </td>

                <td className="py-3.5 px-4 text-right text-xs text-ink/50 whitespace-nowrap">
                  {fmt(t.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

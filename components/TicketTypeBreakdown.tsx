"use client";

import { useMemo } from "react";
import Link from "next/link";
import { LuDownload } from "react-icons/lu";
import { formatCurrency, formatNumber, percent } from "@/helpers/format";
import { useParams } from "next/navigation";
import type { TicketTypeBreak } from "@/helpers/type";

interface Props {
  ticketTypes: TicketTypeBreak[];
  eventId: string;
}

function TicketTypeBreakdown(props: Props) {
  const { ticketTypes, eventId } = props;
  const params = useParams<{ organizer?: string }>();
  const organizer = params?.organizer;
  const verifyHref = organizer
    ? `/${organizer}/dashboard/${eventId}/verify`
    : `/dashboard/${eventId}/verify`;

  const ticketTypeRows = useMemo(() => {
    return ticketTypes.map((t) => {
      const remaining = Math.max(0, t.total - t.sold);
      const lineRevenue = t.sold * t.price;
      const pct = percent(t.sold, t.total);

      return { ...t, remaining, lineRevenue, pct };
    });
  }, [ticketTypes]);

  return (
    <div className="border-t border-slate-200 dark:border-white/10">
      <div className="p-6">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Ticket Type Breakdown
        </h4>

        <div className="mt-4 space-y-4">
          {ticketTypeRows.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {formatCurrency(t.price)} per ticket
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-400">
                    {formatCurrency(t.lineRevenue)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(t.sold)} sold
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(t.remaining)} remaining
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
                Inventory: {formatNumber(t.sold)}/{formatNumber(t.total)}
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-purple-700 dark:bg-purple-500"
                  style={{ width: `${t.pct}%` }}
                  aria-label={`${t.pct}% sold`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Link
            href={verifyHref}
            className="inline-flex items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 active:scale-[0.99]"
          >
            Verify Tickets
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <LuDownload className="text-base" />
            Export Attendees
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <LuDownload className="text-base" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketTypeBreakdown

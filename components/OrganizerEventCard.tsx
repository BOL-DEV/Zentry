"use client";

import { useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import TicketSalesStat from "./TicketSalesStat";
import { formatCurrency, formatNumber } from "@/helpers/format";
import { OrganizerEvent } from "./OrganizerEventsSection";
import TicketTypeBreakdown from "./TicketTypeBreakdown";

function OrganizerEventCard({ event }: { event: OrganizerEvent }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 p-6 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {event.dateTimeText}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-60 lg:grid-cols-4">
            <TicketSalesStat
              sold={event.capacitySold}
              total={event.capacityTotal}
            />

            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Revenue
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(event.revenue)}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Check-ins
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatNumber(event.checkIns)}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Ticket Types
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatNumber(event.ticketTypesCount)}
              </div>
            </div>
          </div>
        </div>

        <span
          className={`mt-1 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-white/5 dark:text-white ${
            open ? "rotate-90" : "rotate-0"
          }`}
          aria-hidden="true"
        >
          <LuChevronRight className="text-lg" />
        </span>
      </button>

      {open ? <TicketTypeBreakdown ticketTypes={event.ticketTypes} /> : null}
    </article>
  );
}

export default OrganizerEventCard;

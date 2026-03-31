"use client";

import { LuChevronRight } from "react-icons/lu";
import TicketSalesStat from "./TicketSalesStat";
import { formatCurrency, formatNumber } from "@/helpers/format";
import type { OrganizerEvent } from "@/helpers/type";
import TicketTypeBreakdown from "./TicketTypeBreakdown";

function OrganizerEventCard({
  event,
  open,
  onToggle,
}: {
  event: OrganizerEvent;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left sm:gap-6 sm:p-6"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {event.dateTimeText}
              </p>
            </div>

            <span
              className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-white/5 dark:text-white ${
                open ? "rotate-90" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              <LuChevronRight className="text-lg" />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <TicketSalesStat
              sold={event.capacitySold}
              total={event.capacityTotal}
            />

            <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/80">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Revenue
              </div>
              <div className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {formatCurrency(event.revenue)}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/80">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Check-ins
              </div>
              <div className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {formatNumber(event.checkIns)}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatNumber(event.checkInPercentage)}% checked in
              </div>
            </div>

            <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/80">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Ticket Types
              </div>
              <div className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {formatNumber(event.ticketTypesCount)}
              </div>
            </div>
          </div>
        </div>
      </button>

      {open ? (
        <TicketTypeBreakdown
          ticketTypes={event.ticketTypes}
          eventId={event.id}
        />
      ) : null}
    </article>
  );
}

export default OrganizerEventCard;

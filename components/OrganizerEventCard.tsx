"use client";

import Link from "next/link";
import { LuArrowRight, LuQrCode } from "react-icons/lu";
import TicketSalesStat from "./TicketSalesStat";
import { formatCurrency, formatNumber } from "@/helpers/format";
import type { OrganizerEvent } from "@/helpers/type";

function OrganizerEventCard({
  event,
  organizer,
}: {
  event: OrganizerEvent;
  organizer: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {event.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {event.dateTimeText}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${organizer}/dashboard/${event.id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white transition hover:bg-purple-800"
            >
              View Event Details
              <LuArrowRight className="text-base" />
            </Link>

            <Link
              href={`/${organizer}/dashboard/${event.id}/verify`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <LuQrCode className="text-base" />
              Open Check-in
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <TicketSalesStat sold={event.capacitySold} total={event.capacityTotal} />

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
    </article>
  );
}

export default OrganizerEventCard;

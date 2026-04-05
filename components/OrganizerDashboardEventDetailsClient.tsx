"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuCalendar,
  LuClock3,
  LuMapPin,
  LuQrCode,
  LuRefreshCw,
  LuUsers,
} from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import SectionPagination from "@/components/SectionPagination";
import TicketTypeBreakdown from "@/components/TicketTypeBreakdown";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { formatCurrency, formatNumber } from "@/helpers/format";
import {
  getOrganizerEventDetails,
  getOrganizerEventSettlementSummary,
  getOrganizerScannerSummary,
  syncOrganizerSettlements,
} from "@/helpers/organizer-api";

function splitDateAndTime(dateTimeText?: string) {
  const trimmed = dateTimeText?.trim() || "";

  if (!trimmed) {
    return {
      dateText: "Date to be announced",
      timeText: "Time to be announced",
    };
  }

  const atParts = trimmed.split(/\s+at\s+/i).map((part) => part.trim()).filter(Boolean);
  if (atParts.length >= 2) {
    return {
      dateText: atParts[0],
      timeText: atParts.slice(1).join(" at "),
    };
  }

  return {
    dateText: trimmed,
    timeText: "Time to be announced",
  };
}

function buildEventHeroFallback(title: string) {
  const safeTitle = encodeURIComponent(title || "Event");
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23ede9fe"/><stop offset="100%25" stop-color="%23c4b5fd"/></linearGradient></defs><rect width="1600" height="900" fill="url(%23bg)"/><rect x="90" y="90" width="1420" height="720" rx="42" fill="%237c3aed" opacity="0.15"/><text x="50%25" y="46%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="74" font-weight="700" fill="%233b0764">Event Image</text><text x="50%25" y="57%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" fill="%235b21b6">${safeTitle}</text></svg>`;
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span className="text-purple-600 dark:text-purple-400">{icon}</span>
        {label}
      </div>
      <p className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function OrganizerDashboardEventDetailsClient({
  organizer,
  eventId,
}: {
  organizer: string;
  eventId: string;
}) {
  const queryClient = useQueryClient();
  const [settlementPage, setSettlementPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-dashboard-event-details", organizer, eventId, settlementPage],
    queryFn: async () => {
      const [eventDetails, scannerSummary, settlementSummary] = await Promise.all([
        getOrganizerEventDetails(organizer, eventId),
        getOrganizerScannerSummary(eventId),
        getOrganizerEventSettlementSummary(eventId, settlementPage, 8).catch(() => null),
      ]);

      return { eventDetails, scannerSummary, settlementSummary };
    },
    placeholderData: (previousData) => previousData,
  });
  const settlementSyncMutation = useMutation({
    mutationFn: syncOrganizerSettlements,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard-event-details", organizer, eventId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard", organizer],
      });
    },
  });

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (error || !data) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't load this event right now."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const event = data.eventDetails.event;
  const scanner = data.scannerSummary.scannerSummary;
  const { dateText, timeText } = splitDateAndTime(event.dateTimeText);
  const locationText = event.locationText?.trim() || "Location to be announced";
  const heroImageSrc = event.imageUrl?.trim() || buildEventHeroFallback(event.title);
  const totalRevenue = event.ticketTypes.reduce(
    (sum, ticketType) => sum + ticketType.price * (ticketType.sold ?? 0),
    0,
  );

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Event Details"
          title={event.title}
          description="See ticket performance, attendee progress, and quick event actions in one place."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="relative h-[18rem] w-full sm:h-[24rem]">
            <Image
              src={heroImageSrc}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
              unoptimized={heroImageSrc.startsWith("data:")}
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex items-center rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                Event Overview
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {event.title}
              </h1>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <InfoCard label="Date" value={dateText} icon={<LuCalendar className="text-lg" />} />
          <InfoCard label="Time" value={timeText} icon={<LuClock3 className="text-lg" />} />
          <InfoCard label="Location" value={locationText} icon={<LuMapPin className="text-lg" />} />
          <InfoCard
            label="Check-in Progress"
            value={`${formatNumber(scanner.totalCheckedIn)} checked in`}
            icon={<LuQrCode className="text-lg" />}
          />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            label="Total Tickets Sold"
            value={formatNumber(scanner.totalTicketsSold)}
            icon={<LuUsers className="text-lg" />}
          />
          <InfoCard
            label="Total Checked In"
            value={formatNumber(scanner.totalCheckedIn)}
            icon={<LuQrCode className="text-lg" />}
          />
          <InfoCard
            label="Pending Check-ins"
            value={formatNumber(scanner.totalUnchecked)}
            icon={<LuUsers className="text-lg" />}
          />
          <InfoCard
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<LuUsers className="text-lg" />}
          />
        </section>

        {data.settlementSummary ? (
          <section className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Settlement Summary
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Track confirmed sales, deductions, and settled payouts for this event.
                </p>
              </div>

              <button
                type="button"
                onClick={() => settlementSyncMutation.mutate()}
                disabled={settlementSyncMutation.isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuRefreshCw className="text-base" />
                {settlementSyncMutation.isPending ? "Syncing..." : "Sync Settlements"}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                label="Confirmed Sales"
                value={formatCurrency(data.settlementSummary.summary.confirmedSales)}
                icon={<LuUsers className="text-lg" />}
              />
              <InfoCard
                label="Pending Settlement"
                value={formatCurrency(data.settlementSummary.summary.pendingSettlement)}
                icon={<LuClock3 className="text-lg" />}
              />
              <InfoCard
                label="Settled"
                value={formatCurrency(data.settlementSummary.summary.settled)}
                icon={<LuQrCode className="text-lg" />}
              />
              <InfoCard
                label="Expected Net"
                value={formatCurrency(
                  data.settlementSummary.summary.expectedNetSettlement,
                )}
                icon={<LuMapPin className="text-lg" />}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <InfoCard
                label="Platform Fees"
                value={formatCurrency(data.settlementSummary.summary.platformFees)}
                icon={<LuUsers className="text-lg" />}
              />
              <InfoCard
                label="Paystack Fees"
                value={formatCurrency(data.settlementSummary.summary.paystackFees)}
                icon={<LuUsers className="text-lg" />}
              />
              <InfoCard
                label="Paid Orders"
                value={formatNumber(data.settlementSummary.summary.totalPaidOrders)}
                icon={<LuUsers className="text-lg" />}
              />
            </div>

            {settlementSyncMutation.isError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {settlementSyncMutation.error instanceof Error
                  ? settlementSyncMutation.error.message
                  : "We couldn't sync settlements right now."}
              </div>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Paid Orders for This Event
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Gross, net, and settlement status for each paid order.
                </p>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Buyer</th>
                      <th className="px-5 py-4 font-semibold">Gross</th>
                      <th className="px-5 py-4 font-semibold">Net</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {data.settlementSummary.orders.length ? (
                      data.settlementSummary.orders.map((order) => (
                        <tr key={order.id} className="text-slate-900 dark:text-white">
                          <td className="px-5 py-4">
                            <div className="font-semibold">{order.buyerName}</div>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {order.paymentReference}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {formatCurrency(order.grossAmount)}
                          </td>
                          <td className="px-5 py-4">
                            {formatCurrency(order.expectedNetSettlement)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                              {order.settlementStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-sm text-slate-600 dark:text-slate-300"
                        >
                          No paid orders available for this event yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <SectionPagination
                page={data.settlementSummary.pagination.page}
                totalPages={data.settlementSummary.pagination.totalPages}
                onPrevious={() =>
                  setSettlementPage((currentPage) => Math.max(1, currentPage - 1))
                }
                onNext={() =>
                  setSettlementPage((currentPage) =>
                    Math.min(
                      data.settlementSummary?.pagination.totalPages ?? currentPage,
                      currentPage + 1,
                    ),
                  )
                }
                isPreviousDisabled={settlementPage <= 1 || isLoading}
                isNextDisabled={
                  settlementPage >= data.settlementSummary.pagination.totalPages || isLoading
                }
              />
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <TicketTypeBreakdown
            ticketTypes={data.eventDetails.ticketTypeBreakdown}
            eventId={eventId}
          />
        </section>
      </div>
    </main>
  );
}

export default OrganizerDashboardEventDetailsClient;

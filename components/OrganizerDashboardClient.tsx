"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuArrowUpRight,
  LuChartColumnIncreasing,
  LuImagePlus,
  LuMedal,
  LuRefreshCw,
  LuTrendingUp,
  LuUsers,
} from "react-icons/lu";
import { TbCoin } from "react-icons/tb";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import SectionPagination from "@/components/SectionPagination";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { formatCurrency, formatNumber } from "@/helpers/format";
import {
  getOrganizerDashboardData,
  getOrganizerOverallSettlementSummary,
  syncOrganizerSettlements,
} from "@/helpers/organizer-api";

function StatCard({
  title,
  value,
  icon,
  helper,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </p>
          <div className="mt-3 text-4xl font-bold tracking-tight text-purple-900 dark:text-purple-200">
            {value}
          </div>
          {helper ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {helper}
            </p>
          ) : null}
        </div>

        <div className="text-purple-700 dark:text-purple-400">{icon}</div>
      </div>
    </div>
  );
}

function EventListCard({
  title,
  events,
  organizer,
  ranked = false,
}: {
  title: string;
  events: Array<{
    id: string;
    title: string;
    dateTimeText: string;
    imageUrl: string;
    capacitySold: number;
    capacityTotal: number;
    isUpcoming: boolean;
  }>;
  organizer: string;
  ranked?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <Link
          href={`/${organizer}/dashboard/events`}
          className="text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-white/10">
        {events.length ? (
          events.map((event, index) => (
            <Link
              key={event.id}
              href={`/${organizer}/dashboard/${event.id}`}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-purple-50 dark:hover:bg-white/5"
            >
              {ranked ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
                  {index + 1}
                </div>
              ) : null}

              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={event.imageUrl.startsWith("data:")}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{event.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{event.dateTimeText}</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatNumber(event.capacitySold)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  / {formatNumber(event.capacityTotal)} sold
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    event.isUpcoming
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                  }`}
                >
                  {event.isUpcoming ? "Upcoming" : "Completed"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-600 dark:text-slate-300">
            No events available yet.
          </div>
        )}
      </div>
    </div>
  );
}

function OrganizerDashboardClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const { token, user: authUser } = useAuthSession();
  const queryClient = useQueryClient();
  const [settlementPage, setSettlementPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-dashboard", organizer],
    queryFn: () => getOrganizerDashboardData(organizer),
    enabled: Boolean(token) && authUser?.role !== "staff",
  });
  const { data: settlementData, isFetching: isSettlementFetching } = useQuery({
    queryKey: ["organizer-dashboard-settlements", organizer, settlementPage],
    queryFn: () => getOrganizerOverallSettlementSummary(settlementPage, 6),
    enabled: Boolean(token) && authUser?.role !== "staff",
    placeholderData: (previousData) => previousData,
  });
  const settlementSyncMutation = useMutation({
    mutationFn: syncOrganizerSettlements,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard", organizer],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard-settlements", organizer],
      });
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace(
        `/login?next=/${organizer}/dashboard&reason=auth-required`,
      );
    }
  }, [organizer, router, token]);

  useEffect(() => {
    if (!isAuthIssue(error)) return;

    clearAuthToken();
    router.replace(
      `/login?next=/${organizer}/dashboard&reason=session-expired`,
    );
  }, [error, organizer, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to login"
        description="Taking you back to sign in."
      />
    );
  }

  if (authUser?.role === "staff") {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-10">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This account is set up for guest check-in, so we are sending you to the check-in area.
            </p>
            <Link
              href={`/${organizer}/staff`}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Open Check-in Area
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <FullPageLoader
        title="Building your dashboard"
        description="We are loading your event sales, check-ins, and latest activity."
      />
    );
  }

  if (error || !data) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-10">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't load your dashboard right now."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const nextEvent = data.nextEvent;
  const squadFeeTotal =
    data.totals.squadGatewayFees + data.totals.squadTransferFees;
  const totalFeeAmount = data.totals.platformFees + squadFeeTotal;
  const recentEvents = data.events
    .slice()
    .sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime(),
    )
    .slice(0, 5);
  const topEvents = data.events
    .slice()
    .sort((left, right) => {
      if (right.capacitySold !== left.capacitySold) {
        return right.capacitySold - left.capacitySold;
      }

      return right.revenue - left.revenue;
    })
    .slice(0, 5);

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 py-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <WorkspaceTopbar
              eyebrow="Event Dashboard"
              title="Run bold events."
              description="Everything you need to manage events, understand sales, and keep attendees moving fast."
              showLogoutButton={false}
              showActions={false}
            />

            <h2 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Track every ticket.
              <span className="block text-purple-700 dark:text-purple-400">
                Stay on top of check-ins.
              </span>
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${organizer}/dashboard/create`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Create Event
              </Link>

              <Link
                href={`/${organizer}/dashboard/gallery/create`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                <LuImagePlus className="mr-2 text-base" />
                Add Gallery Image
              </Link>

              <Link
                href={`/${organizer}/dashboard/gallery`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Manage Gallery
                <LuArrowUpRight className="text-base" />
              </Link>

              <Link
                href={`/${organizer}/dashboard/events`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Manage Events
                <LuArrowUpRight className="text-base" />
              </Link>

              <Link
                href={`/${organizer}/dashboard/profile`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Edit Profile
                <LuArrowUpRight className="text-base" />
              </Link>

              <Link
                href={`/${organizer}/dashboard/staff`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Staff Management
                <LuArrowUpRight className="text-base" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                  Next Up
                </p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {nextEvent?.title ?? "Your next event"}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {nextEvent?.dateTimeText ?? "No upcoming events yet"}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Tickets Sold
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {formatNumber(nextEvent?.capacitySold ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Revenue
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(nextEvent?.revenue ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-100">
                  <LuMedal className="text-base" />
                  {topEvents[0]
                    ? `${topEvents[0].title} is your best-selling event right now.`
                    : "Your best-performing events will show up here as sales come in."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <EventListCard
            title="Recent Events"
            events={recentEvents}
            organizer={organizer}
          />
          <EventListCard
            title="Top Events"
            events={topEvents}
            organizer={organizer}
            ranked
          />
        </div>
      </div>

      <section className="mx-auto lg:max-w-7xl px-6 pb-14">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          At a glance
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          A quick look at how your events are performing.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Events"
            value={formatNumber(data.totals.activeEvents)}
            icon={<LuChartColumnIncreasing size={20} />}
          />
          <StatCard
            title="Total Tickets Sold"
            value={formatNumber(data.totals.ticketsSold)}
            icon={<LuTrendingUp size={20} />}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.totals.revenue)}
            icon={<TbCoin size={20} />}
          />
          <StatCard
            title="Check-ins"
            value={formatNumber(data.totals.checkIns)}
            helper={`${formatNumber(data.totals.checkInPercentage)}% checked in`}
            icon={<LuUsers size={20} />}
          />
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cash Flow & Settlements
          </h3>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Review confirmed sales, pending vs settled totals, and each paid
              order as returned by the settlement summary endpoint.
            </p>
            <button
              type="button"
              onClick={() => settlementSyncMutation.mutate()}
              disabled={settlementSyncMutation.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <LuRefreshCw
                className={`text-base ${settlementSyncMutation.isPending ? "animate-spin" : ""}`}
              />
              {settlementSyncMutation.isPending
                ? "Syncing Settlements..."
                : "Sync Settlements"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Sales (Confirmed)"
              value={formatCurrency(data.totals.confirmedSales)}
              helper={`${formatNumber(data.totals.totalPaidOrders)} paid orders`}
              icon={<TbCoin size={20} />}
            />
            <StatCard
              title="Organizer Payout Amount"
              value={formatCurrency(data.totals.organizerPayoutAmount)}
              helper="Net organizer amount after platform fees plus gateway deductions"
              icon={<LuArrowUpRight size={20} />}
            />
            <StatCard
              title="Total Fees"
              value={formatCurrency(totalFeeAmount)}
              helper="Platform fee plus Squad deductions across organizer history"
              icon={<LuChartColumnIncreasing size={20} />}
            />
          </div>

          {settlementSyncMutation.isSuccess && settlementSyncMutation.data ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
              Prepared settlement batches. Matched{" "}
              {formatNumber(settlementSyncMutation.data.ordersMatched)} eligible
              orders, processed{" "}
              {formatNumber(settlementSyncMutation.data.ordersProcessed)} orders
              across{" "}
              {formatNumber(
                settlementSyncMutation.data.eventGroupsPrepared ??
                  settlementSyncMutation.data.payoutsSucceeded,
              )}{" "}
              event batches.
            </div>
          ) : null}

          {settlementSyncMutation.isError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {settlementSyncMutation.error instanceof Error
                ? settlementSyncMutation.error.message
                : "We couldn't sync settlements right now."}
            </div>
          ) : null}

          {settlementData?.events.length ? (
            <div className="flex flex-col mt-8 gap-8">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Event Settlement Breakdown
                  </h4>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    A per-event view of confirmed sales, combined fees, and
                    organizer payout totals.
                  </p>
                </div>

                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Event</th>
                        <th className="px-5 py-4 font-semibold">Confirmed</th>
                        <th className="px-5 py-4 font-semibold">Total Fees</th>
                        <th className="px-5 py-4 font-semibold">Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {settlementData.events.map((event) => (
                        <tr
                          key={event.eventId}
                          className="text-slate-900 dark:text-white"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold">{event.title}</div>
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {event.location}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {formatCurrency(event.confirmedSales)}
                          </td>
                          <td className="px-5 py-4">
                            {formatCurrency(
                              (event.platformFees ?? 0) +
                              (event.squadGatewayFees ?? 0) +
                                (event.squadTransferFees ?? 0),
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {formatCurrency(event.organizerPayoutAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <SectionPagination
                  page={settlementData.pagination.page}
                  totalPages={settlementData.pagination.totalPages}
                  onPrevious={() =>
                    setSettlementPage((currentPage) =>
                      Math.max(1, currentPage - 1),
                    )
                  }
                  onNext={() =>
                    setSettlementPage((currentPage) =>
                      Math.min(
                        settlementData.pagination.totalPages,
                        currentPage + 1,
                      ),
                    )
                  }
                  isPreviousDisabled={
                    settlementPage <= 1 || isSettlementFetching
                  }
                  isNextDisabled={
                    settlementPage >= settlementData.pagination.totalPages ||
                    isSettlementFetching
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default OrganizerDashboardClient;

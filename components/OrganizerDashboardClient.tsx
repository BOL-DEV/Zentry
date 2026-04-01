"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  LuArrowUpRight,
  LuChartColumnIncreasing,
  LuCircleCheck,
  LuTrendingUp,
  LuUsers,
} from "react-icons/lu";
import { TbCoin } from "react-icons/tb";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import OrganizerEventsSection from "@/components/OrganizerEventsSection";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { useAuthSession } from "@/helpers/auth-client";
import { formatCurrency, formatNumber } from "@/helpers/format";
import { getOrganizerDashboardData } from "@/helpers/organizer-api";

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

function OrganizerDashboardClient({ organizer }: { organizer: string }) {
  const { token, user: authUser } = useAuthSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-dashboard", organizer],
    queryFn: () => getOrganizerDashboardData(organizer),
    enabled: Boolean(token) && authUser?.role !== "staff",
  });

  if (!token) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-10">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sign in to view your event dashboard.
            </p>
            <Link
              href={`/login?next=/${organizer}/dashboard`}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Sign In
            </Link>
          </Card>
        </div>
      </main>
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

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <WorkspaceTopbar
              eyebrow="Event Dashboard"
              title="Run bold events."
              description="Everything you need to manage events, understand sales, and keep attendees moving fast."
            />

            <h2 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Track every ticket.
              <span className="block text-purple-700 dark:text-purple-400">
                Stay on top of check-ins.
              </span>
            </h2>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/${organizer}/dashboard`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Open Dashboard
              </Link>

              <Link
                href={`/${organizer}/dashboard/create`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Create Event
              </Link>

              <Link
                href={`/${organizer}/dashboard/gallery/create`}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                Add Gallery Image
              </Link>

              <Link
                href={`/${organizer}/events`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Manage Events
                <LuArrowUpRight className="text-base" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <LuCircleCheck className="text-emerald-600 dark:text-emerald-300" />
                Live sales snapshot
              </span>
              <span className="inline-flex items-center gap-2">
                <LuCircleCheck className="text-emerald-600 dark:text-emerald-300" />
                Ticket breakdown
              </span>
              <span className="inline-flex items-center gap-2">
                <LuCircleCheck className="text-emerald-600 dark:text-emerald-300" />
                Check-in tracking
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
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
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Tickets Sold
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {formatNumber(nextEvent?.capacitySold ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Revenue
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(nextEvent?.revenue ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/${organizer}/events`}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
                  >
                    View Your Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
      </section>

      <OrganizerEventsSection events={data.events} organizer={organizer} />
    </main>
  );
}

export default OrganizerDashboardClient;

import Link from "next/link";
import OrganizerEventsSection from "@/components/OrganizerEventsSection";
import { organizerDemoEvents } from "@/data/demo";
import { formatCurrency, formatNumber } from "@/helpers/format";
import {
  LuArrowUpRight,
  LuChartColumnIncreasing,
  LuCircleCheck,
  LuTrendingUp,
  LuUsers,
} from "react-icons/lu";
import { TbCoin } from "react-icons/tb";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
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
        </div>

        <div className="text-purple-700 dark:text-purple-400">{icon}</div>
      </div>
    </div>
  );
}

function Page() {
  const events = organizerDemoEvents;
  const totals = events.reduce(
    (acc, e) => {
      acc.activeEvents += 1;
      acc.ticketsSold += e.capacitySold;
      acc.revenue += e.revenue;
      acc.checkIns += e.checkIns;
      return acc;
    },
    { activeEvents: 0, ticketsSold: 0, revenue: 0, checkIns: 0 },
  );

  const nextEvent = events[0];

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">
              Organizer Portal
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Run bold events.
              <span className="block text-purple-700 dark:text-purple-400">
                Track every ticket.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Everything you need to manage events, understand sales, and keep
              attendees moving—fast.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="./dashboard"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Open Dashboard
              </Link>

              <Link
                href="./events"
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
                  {nextEvent?.dateTimeText ?? ""}
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
                    href="./events"
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
          Today’s key numbers across your active events.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Events"
            value={formatNumber(totals.activeEvents)}
            icon={<LuChartColumnIncreasing size={20} />}
          />
          <StatCard
            title="Total Tickets Sold"
            value={formatNumber(totals.ticketsSold)}
            icon={<LuTrendingUp size={20} />}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totals.revenue)}
            icon={<TbCoin size={20} />}
          />
          <StatCard
            title="Check-ins"
            value={formatNumber(totals.checkIns)}
            icon={<LuUsers size={20} />}
          />
        </div>
      </section>

      <OrganizerEventsSection events={events} />
    </main>
  );
}

export default Page;

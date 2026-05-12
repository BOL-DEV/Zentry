"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LuArrowUpRight,
  LuBuilding2,
  LuCalendarDays,
  LuCreditCard,
  LuSettings2,
  LuTicket,
  LuTrendingUp,
  LuUsers,
} from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";

import Card from "@/components/Card";
import DashboardStatsGrid from "@/components/DashboardStatsGrid";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import {
  getAdminAnalytics,
  getAdminPlatformFeeSettings,
  getAdminProfile,
} from "@/helpers/organizer-api";

function formatDateTime(value?: string | null) {
  if (!value) return "Not updated yet";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not updated yet";

  return parsed.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {helper}
      </p>
    </div>
  );
}

function AdminDashboardClient() {
  const router = useRouter();
  const { token, user } = useAdminAuthSession();

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const analyticsQuery = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: getAdminAnalytics,
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  const platformFeeSettingsQuery = useQuery({
    queryKey: ["admin-platform-fee-settings"],
    queryFn: getAdminPlatformFeeSettings,
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin&reason=auth-required");
    }
  }, [router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;

    clearAdminAuthToken();
    router.replace("/admin/login?next=/dashboard/admin&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you to the secure admin sign-in page."
      />
    );
  }

  if (
    profileQuery.isLoading ||
    profileQuery.isFetching ||
    analyticsQuery.isLoading ||
    platformFeeSettingsQuery.isLoading
  ) {
    return (
      <FullPageLoader
        title="Opening admin dashboard"
        description="Loading top-level platform analytics and admin insights."
      />
    );
  }

  if (
    profileQuery.error ||
    analyticsQuery.error ||
    platformFeeSettingsQuery.error ||
    !profileQuery.data?.admin ||
    !analyticsQuery.data
  ) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : platformFeeSettingsQuery.error instanceof Error
          ? platformFeeSettingsQuery.error.message
        : analyticsQuery.error instanceof Error
          ? analyticsQuery.error.message
          : "We couldn't load the admin dashboard right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">
            {message}
          </Card>
        </div>
      </main>
    );
  }

  const analytics = analyticsQuery.data;
  const activationRate =
    analytics.organizers.total > 0
      ? Math.round((analytics.organizers.active / analytics.organizers.total) * 100)
      : 0;
  const checkInRate =
    analytics.tickets.totalIssued > 0
      ? Math.round((analytics.tickets.totalCheckedIn / analytics.tickets.totalIssued) * 100)
      : 0;
  const averageOrderValue =
    analytics.orders.totalPaidOrders > 0
      ? analytics.orders.grossRevenue / analytics.orders.totalPaidOrders
      : 0;
  const eventCompletionRate =
    analytics.events.total > 0
      ? Math.round((analytics.events.completed / analytics.events.total) * 100)
      : 0;
  const attendanceGap = Math.max(
    0,
    analytics.tickets.totalIssued - analytics.tickets.totalCheckedIn,
  );
  const platformFeeSettings = platformFeeSettingsQuery.data;

  const stats = [
    {
      title: "Total Organizers",
      value: analytics.organizers.total,
      icon: <LuBuilding2 className="text-2xl" />,
    },
    {
      title: "Public Events",
      value: analytics.events.total,
      icon: <LuCalendarDays className="text-2xl" />,
    },
    {
      title: "Paid Orders",
      value: analytics.orders.totalPaidOrders,
      icon: <LuCreditCard className="text-2xl" />,
    },
    {
      title: "Tickets Issued",
      value: analytics.tickets.totalIssued,
      icon: <LuTicket className="text-2xl" />,
    },
  ];

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="border-b border-purple-200/70 bg-white/80 pt-10 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Platform summary and admin insight home.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                This is the bird’s-eye workspace: summary, derived analytics, and fast paths into the deeper admin pages for organizers and orders.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/admin/organizers"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Open Organizers
                <LuArrowUpRight className="text-base" />
              </Link>
              <Link
                href="/dashboard/admin/orders"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Open Orders
              </Link>
              <Link
                href="/dashboard/admin/organizers/create"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Create Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DashboardStatsGrid items={stats} />

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Platform Insight
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                Derived from the admin analytics feed
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InsightCard
                  label="Organizer activation"
                  value={`${activationRate}%`}
                  helper={`${analytics.organizers.active} active out of ${analytics.organizers.total} total organizers`}
                />
                <InsightCard
                  label="Event completion"
                  value={`${eventCompletionRate}%`}
                  helper={`${analytics.events.completed} completed and ${analytics.events.upcoming} upcoming events`}
                />
                <InsightCard
                  label="Average order value"
                  value={formatCurrency(averageOrderValue)}
                  helper="Gross revenue divided by total paid platform orders"
                />
                <InsightCard
                  label="Check-in rate"
                  value={`${checkInRate}%`}
                  helper={`${analytics.tickets.totalCheckedIn} tickets checked in from ${analytics.tickets.totalIssued} issued`}
                />
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Revenue + Attendance
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    Financial pulse
                  </h2>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <LuTrendingUp className="text-xl" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Gross revenue
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {formatCurrency(analytics.orders.grossRevenue)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    confirmed across all paid platform orders
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Platform fees
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {formatCurrency(analytics.revenue.platformFees)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    revenue captured by the platform from documented admin analytics
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    Attendance gap
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {attendanceGap}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    issued tickets not yet checked in
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5 lg:col-span-3">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <LuSettings2 className="text-xl" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                    Platform fee settings
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Control the flat fee, threshold amount, and percentage used for new ticket purchases. Existing orders are not recalculated.
                  </p>
                  {platformFeeSettings ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Flat below threshold
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                          {formatCurrency(platformFeeSettings.flatFeeBelowThreshold)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Threshold amount
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                          {formatCurrency(platformFeeSettings.thresholdAmount)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Percent above threshold
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                          {(platformFeeSettings.percentAboveThreshold * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="w-full max-w-xl space-y-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Global platform-fee settings are now the fallback only. Custom platform rates should be managed inside each organizer&apos;s admin page.
                  </p>

                  {platformFeeSettings ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Default flat fee
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                            {formatCurrency(platformFeeSettings.flatFeeBelowThreshold)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Default threshold
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                            {formatCurrency(platformFeeSettings.thresholdAmount)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Default rate
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                            {(platformFeeSettings.percentAboveThreshold * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
                        <p>Last updated: {formatDateTime(platformFeeSettings.updatedAt)}</p>
                        <p>These values apply only when an organizer has no custom override.</p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                <LuBuilding2 className="text-xl" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                Organizer management
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Review all organizers, compare their event and revenue performance, and open the dedicated organizer control pages from one place.
              </p>
              <Link
                href="/dashboard/admin/organizers"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
              >
                Go to organizers
                <LuArrowUpRight className="text-base" />
              </Link>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                <LuCreditCard className="text-xl" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                Order operations
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Track buyer activity, payment status, and settlement progression without crowding the analytics home screen.
              </p>
              <Link
                href="/dashboard/admin/orders"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
              >
                Go to orders
                <LuArrowUpRight className="text-base" />
              </Link>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <LuUsers className="text-xl" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                Admin actions
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Create new organizers and dashboard users directly from admin territory, then continue into the operations pages for monitoring and drilldown.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/admin/organizers/create"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
                >
                  Create organizer
                  <LuArrowUpRight className="text-base" />
                </Link>
                <Link
                  href="/dashboard/admin/users/create"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
                >
                  Create user
                  <LuArrowUpRight className="text-base" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboardClient;

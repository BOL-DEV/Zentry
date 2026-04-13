"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft, LuCalendarDays, LuMail, LuMapPin, LuPhone, LuReceiptText } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import { getAdminEventDetail, getAdminProfile } from "@/helpers/organizer-api";

function formatDateTime(value?: string | null) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function StatusPill({ children, tone }: { children: React.ReactNode; tone: "emerald" | "slate" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      tone === "emerald"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
    }`}>
      {children}
    </span>
  );
}

type Props = { eventId: string };

function AdminEventDetailsClient({ eventId }: Props) {
  const router = useRouter();
  const { token, user } = useAdminAuthSession();

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const eventQuery = useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: () => getAdminEventDetail(eventId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/events/${eventId}`)}&reason=auth-required`);
    }
  }, [eventId, router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;
    clearAdminAuthToken();
    router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/events/${eventId}`)}&reason=session-expired`);
  }, [eventId, profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || eventQuery.isLoading) {
    return <FullPageLoader title="Loading event details" description="Pulling event performance, organizer info, and recent order activity." />;
  }

  if (profileQuery.error || eventQuery.error || !profileQuery.data?.admin || !eventQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : eventQuery.error instanceof Error
          ? eventQuery.error.message
          : "We couldn't load this event right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader role="admin" email={profileQuery.data?.admin.email || user?.email || "Platform workspace"} />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const { event, stats, recentOrders } = eventQuery.data;
  const feeValue = stats.paymentProcessingFees ?? stats.paystackFees ?? 0;
  const checkInRate = stats.totalTicketsSold > 0 ? Math.round((stats.totalCheckedInTickets / stats.totalTicketsSold) * 100) : 0;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader role="admin" email={profileQuery.data.admin.email || user?.email || "Platform workspace"} />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/dashboard/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">
            <LuArrowLeft className="text-base" />
            Back to events
          </Link>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">Event Detail</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">{event.title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{event.organizer.name} • @{event.organizer.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={event.isUpcoming ? "emerald" : "slate"}>{event.isUpcoming ? "Upcoming" : "Completed"}</StatusPill>
              <StatusPill tone={event.organizer.isActive ? "emerald" : "slate"}>{event.organizer.isActive ? "Organizer Active" : "Organizer Inactive"}</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Event profile</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{event.description || "No event description provided."}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><LuCalendarDays className="text-base text-purple-600 dark:text-purple-300" />{formatDateTime(event.date)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><LuMapPin className="text-base text-purple-600 dark:text-purple-300" />{event.location || "No location"}</p>
                </div>
                {event.dressCode ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Dress Code</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.dressCode}</p>
                  </div>
                ) : null}
                {event.policies ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Policies</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.policies}</p>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                  <LuReceiptText className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Recent Orders</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Latest payment activity</h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-950 dark:text-white">{order.buyerName}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.buyerEmail}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ref: {order.paymentReference || "No payment reference"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-950 dark:text-white">{formatCurrency(order.totalAmount)}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.paymentStatus}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.settlementStatus || "No settlement status"}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    No recent order activity for this event yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Performance summary</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Paid Orders</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{stats.totalPaidOrders}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Tickets Sold</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{stats.totalTicketsSold}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Gross Revenue</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(stats.grossRevenue)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Expected Net</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(stats.expectedNetSettlement)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Platform Fees</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(stats.platformFees)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Processing Fees</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(feeValue)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Check-in Rate</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{checkInRate}%</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stats.totalCheckedInTickets} checked in from {stats.totalTicketsSold} sold tickets</p></div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Organizer contact</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{event.organizer.name}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">@{event.organizer.slug}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuMail className="text-base text-purple-600 dark:text-purple-300" />{event.organizer.contactEmail || "No contact email"}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuPhone className="text-base text-purple-600 dark:text-purple-300" />{event.organizer.contactPhone || "No contact phone"}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminEventDetailsClient;

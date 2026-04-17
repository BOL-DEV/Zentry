"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft, LuCreditCard, LuMapPin, LuReceiptText } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import { getAdminOrderDetail, getAdminProfile } from "@/helpers/organizer-api";

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

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "emerald" | "amber" | "rose" | "slate";
}) {
  const styles =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : tone === "amber"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        : tone === "rose"
          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

type Props = {
  orderId: string;
};

function AdminOrderDetailsClient({ orderId }: Props) {
  const router = useRouter();
  const { token, user } = useAdminAuthSession();

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const orderQuery = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => getAdminOrderDetail(orderId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/orders/${orderId}`)}&reason=auth-required`);
    }
  }, [orderId, router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;

    clearAdminAuthToken();
    router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/orders/${orderId}`)}&reason=session-expired`);
  }, [orderId, profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || orderQuery.isLoading) {
    return <FullPageLoader title="Loading order details" description="Pulling buyer, payment, settlement, and item breakdown data." />;
  }

  if (profileQuery.error || orderQuery.error || !profileQuery.data?.admin || !orderQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : orderQuery.error instanceof Error
          ? orderQuery.error.message
          : "We couldn't load this order right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader role="admin" email={profileQuery.data?.admin.email || user?.email || "Platform workspace"} />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const { order } = orderQuery.data;
  const squadFeeTotal = (order.squadGatewayFee ?? 0) + (order.squadTransferFee ?? 0);
  const settlementTone =
    order.settlementStatus === "settled"
      ? "emerald"
      : order.settlementStatus === "failed"
        ? "rose"
        : order.settlementStatus === "processing"
          ? "amber"
          : "slate";

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader role="admin" email={profileQuery.data.admin.email || user?.email || "Platform workspace"} />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/dashboard/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">
            <LuArrowLeft className="text-base" />
            Back to orders
          </Link>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
                Order Detail
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                {order.buyerName}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                {order.buyerEmail} | {order.event.title} | @{order.organizer.slug}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill tone={order.paymentStatus === "paid" ? "emerald" : order.paymentStatus === "pending" ? "amber" : "rose"}>
                {order.paymentStatus}
              </StatusPill>
              {order.settlementStatus ? <StatusPill tone={settlementTone}>{order.settlementStatus}</StatusPill> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                  <LuReceiptText className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Order Items</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">What the buyer paid for</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-950 dark:text-white">{item.ticketTypeName}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-950 dark:text-white">{formatCurrency(item.subtotal)}</p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Unit Price</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{formatCurrency(item.unitPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Ticket Type ID</p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-950 dark:text-white">{item.ticketTypeId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <LuCreditCard className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Payment + Settlement</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Financial breakdown</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Amount</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Organizer Payout</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(order.organizerPayoutAmount || 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Platform Fees</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(order.platformFeeTotal || 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Squad Fees</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(squadFeeTotal)}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>Order reference: {order.paymentReference || "Not available yet"}</p>
                <p>Paid at: {formatDateTime(order.paidAt)}</p>
                <p>Settlement date: {formatDateTime(order.settlementDate)}</p>
                <p>Settlement batch: {order.settlementBatchId || "No settlement batch"}</p>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Context</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Event</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{order.event.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuMapPin className="text-base text-purple-600 dark:text-purple-300" />{order.event.location}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatDateTime(order.event.date)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Organizer</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{order.organizer.name}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">@{order.organizer.slug}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Lifecycle</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Created: {formatDateTime(order.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Updated: {formatDateTime(order.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminOrderDetailsClient;

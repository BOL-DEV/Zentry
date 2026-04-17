"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowUpRight, LuCreditCard } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import { getAdminOrders, getAdminProfile } from "@/helpers/organizer-api";

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

function AdminOrdersClient() {
  const router = useRouter();
  const { token, user } = useAdminAuthSession();
  const [page, setPage] = useState(1);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => getAdminOrders({ page, limit: 10 }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin/orders&reason=auth-required");
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
    router.replace("/admin/login?next=/dashboard/admin/orders&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you to the secure admin sign-in page."
      />
    );
  }

  if (profileQuery.isLoading || profileQuery.isFetching || ordersQuery.isLoading) {
    return (
      <FullPageLoader
        title="Loading orders"
        description="Pulling platform payments, order status, and settlement activity."
      />
    );
  }

  if (profileQuery.error || ordersQuery.error || !profileQuery.data?.admin) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : ordersQuery.error instanceof Error
          ? ordersQuery.error.message
          : "We couldn't load orders right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader
          role="admin"
          email={profileQuery.data?.admin.email || user?.email || "Platform workspace"}
        />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader
        role="admin"
        email={profileQuery.data.admin.email || user?.email || "Platform workspace"}
      />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
            Order Operations
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Platform orders and settlement movement.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Track who bought what, how each order settled, and which organizer or event it belongs to without crowding the dashboard home.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="space-y-5">
            {orders.length > 0 ? (
              orders.map((order) => {
                const settlementTone =
                  order.settlementStatus === "settled"
                    ? "emerald"
                    : order.settlementStatus === "failed"
                      ? "rose"
                      : order.settlementStatus === "processing"
                        ? "amber"
                        : "slate";

                return (
                  <Card
                    key={order.id}
                    className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                          <LuCreditCard className="text-xl" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                          {order.buyerName}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {order.buyerEmail}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          {order.event.title} | @{order.organizer.slug}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatusPill
                          tone={
                            order.paymentStatus === "paid"
                              ? "emerald"
                              : order.paymentStatus === "pending"
                                ? "amber"
                                : "rose"
                          }
                        >
                          {order.paymentStatus}
                        </StatusPill>
                        {order.settlementStatus ? (
                          <StatusPill tone={settlementTone}>
                            {order.settlementStatus}
                          </StatusPill>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Total Amount
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Platform Fees
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                          {formatCurrency(order.platformFeeTotal || 0)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Organizer Payout
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                          {formatCurrency(order.organizerPayoutAmount || 0)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Squad Fees
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                          {formatCurrency(
                            (order.squadGatewayFee ?? 0) + (order.squadTransferFee ?? 0),
                          )}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Paid At
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                          {formatDateTime(order.paidAt || order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Order reference: {order.paymentReference || "Not available yet"}
                      </p>
                      <Link
                        href={`/dashboard/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                      >
                        Open Order
                        <LuArrowUpRight className="text-base" />
                      </Link>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="text-sm text-slate-600 dark:text-slate-300">
                No orders available right now.
              </Card>
            )}
          </div>

          {pagination?.totalPages && pagination.totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Previous
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Page {page} of {pagination.totalPages}
              </p>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(pagination.totalPages || current, current + 1))
                }
                disabled={page >= (pagination.totalPages || page)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default AdminOrdersClient;

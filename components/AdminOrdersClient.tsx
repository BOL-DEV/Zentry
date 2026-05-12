"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowUpRight, LuCreditCard, LuFilterX, LuRefreshCw, LuSearch } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency, formatNumber } from "@/helpers/format";
import {
  getAdminDailyPayouts,
  getAdminEvents,
  getAdminOrganizers,
  getAdminOrders,
  getAdminProfile,
  syncAdminSettlements,
  toggleAdminSettlementBatch,
} from "@/helpers/organizer-api";

function getPreviousDateInput() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user } = useAdminAuthSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(() => Number(searchParams.get("page") || "1") || 1);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [paymentStatus, setPaymentStatus] = useState(
    () => searchParams.get("paymentStatus") || "all",
  );
  const [settlementStatus, setSettlementStatus] = useState(
    () => searchParams.get("settlementStatus") || "all",
  );
  const [eventId, setEventId] = useState(() => searchParams.get("eventId") || "");
  const [organizerId, setOrganizerId] = useState(() => searchParams.get("organizerId") || "");
  const [eventFilterText, setEventFilterText] = useState("");
  const [organizerFilterText, setOrganizerFilterText] = useState("");
  const [payoutDate, setPayoutDate] = useState(() => getPreviousDateInput());
  const [payoutStatus, setPayoutStatus] = useState<"processing" | "settled" | "all">("processing");

  function updateListUrl(nextState: {
    page?: number;
    search?: string;
    paymentStatus?: string;
    settlementStatus?: string;
    eventId?: string;
    organizerId?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const resolvedPage = nextState.page ?? page;
    const resolvedSearch = nextState.search ?? search;
    const resolvedPaymentStatus = nextState.paymentStatus ?? paymentStatus;
    const resolvedSettlementStatus =
      nextState.settlementStatus ?? settlementStatus;
    const resolvedEventId = nextState.eventId ?? eventId;
    const resolvedOrganizerId = nextState.organizerId ?? organizerId;

    if (resolvedPage > 1) params.set("page", String(resolvedPage));
    else params.delete("page");

    if (resolvedSearch.trim()) params.set("search", resolvedSearch.trim());
    else params.delete("search");

    if (resolvedPaymentStatus !== "all") params.set("paymentStatus", resolvedPaymentStatus);
    else params.delete("paymentStatus");

    if (resolvedSettlementStatus !== "all") {
      params.set("settlementStatus", resolvedSettlementStatus);
    } else {
      params.delete("settlementStatus");
    }

    if (resolvedEventId.trim()) params.set("eventId", resolvedEventId.trim());
    else params.delete("eventId");

    if (resolvedOrganizerId.trim()) params.set("organizerId", resolvedOrganizerId.trim());
    else params.delete("organizerId");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const ordersQuery = useQuery({
    queryKey: [
      "admin-orders",
      page,
      search,
      paymentStatus,
      settlementStatus,
      eventId,
      organizerId,
    ],
    queryFn: () =>
      getAdminOrders({
        page,
        limit: 10,
        search: search.trim() || undefined,
        paymentStatus:
          paymentStatus === "all"
            ? undefined
            : (paymentStatus as "pending" | "paid" | "cancelled"),
        settlementStatus:
          settlementStatus === "all"
            ? undefined
            : (settlementStatus as "pending" | "processing" | "settled" | "failed"),
        eventId: eventId.trim() || undefined,
        organizerId: organizerId.trim() || undefined,
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const payoutReportQuery = useQuery({
    queryKey: ["admin-daily-payouts", payoutDate, payoutStatus, organizerId],
    queryFn: () =>
      getAdminDailyPayouts({
        date: payoutDate,
        status: payoutStatus,
        organizerId: organizerId.trim() || undefined,
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    placeholderData: (previousData) => previousData,
  });
  const organizerOptionsQuery = useQuery({
    queryKey: ["admin-organizer-filter-options"],
    queryFn: () =>
      getAdminOrganizers({
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    staleTime: 60_000,
  });
  const eventOptionsQuery = useQuery({
    queryKey: ["admin-event-filter-options", organizerId],
    queryFn: () =>
      getAdminEvents({
        page: 1,
        limit: 100,
        organizerId: organizerId.trim() || undefined,
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    staleTime: 60_000,
  });
  const settlementSyncMutation = useMutation({
    mutationFn: syncAdminSettlements,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin-daily-payouts"],
      });
    },
  });
  const toggleBatchMutation = useMutation({
    mutationFn: ({
      batchId,
      settled,
    }: {
      batchId: string;
      settled: boolean;
    }) => toggleAdminSettlementBatch(batchId, settled),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["admin-daily-payouts"],
      });
    },
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

  const organizerOptions = organizerOptionsQuery.data?.organizers ?? [];
  const eventOptions = eventOptionsQuery.data?.events ?? [];

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
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;

  function handleOrganizerFilterInput(nextValue: string) {
    setOrganizerFilterText(nextValue);

    const normalizedValue = nextValue.trim().toLowerCase();
    const matchedOrganizer = organizerOptions.find(
      (organizer) => organizer.name.trim().toLowerCase() === normalizedValue,
    );

    setPage(1);
    setEventId("");
    setEventFilterText("");
    setOrganizerId(matchedOrganizer?.id ?? "");
    updateListUrl({
      organizerId: matchedOrganizer?.id ?? "",
      eventId: "",
      page: 1,
    });
  }

  function handleEventFilterInput(nextValue: string) {
    setEventFilterText(nextValue);

    const normalizedValue = nextValue.trim().toLowerCase();
    const matchedEvent = eventOptions.find(
      (event) => event.title.trim().toLowerCase() === normalizedValue,
    );

    setPage(1);
    setEventId(matchedEvent?.id ?? "");
    updateListUrl({
      eventId: matchedEvent?.id ?? "",
      page: 1,
    });
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="border-b border-purple-200/70 bg-white/80 pt-10 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
            Order Operations
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Platform orders and settlement movement.
          </h1>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Track who bought what, how each order settled, and which organizer or event it belongs to without crowding the dashboard home.
            </p>
            <button
              type="button"
              onClick={() => settlementSyncMutation.mutate()}
              disabled={settlementSyncMutation.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              <LuRefreshCw
                className={`text-base ${settlementSyncMutation.isPending ? "animate-spin" : ""}`}
              />
              {settlementSyncMutation.isPending
                ? "Syncing Settlements..."
                : "Sync Settlements"}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          {settlementSyncMutation.isSuccess && settlementSyncMutation.data ? (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
              Prepared settlement batches. Matched{" "}
              {formatNumber(settlementSyncMutation.data.ordersMatched)} eligible
              orders, processed{" "}
              {formatNumber(settlementSyncMutation.data.ordersProcessed)} across{" "}
              {formatNumber(
                settlementSyncMutation.data.eventGroupsPrepared ??
                  settlementSyncMutation.data.payoutsSucceeded,
              )}{" "}
              event batches.
            </div>
          ) : null}

          {settlementSyncMutation.isError ? (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {settlementSyncMutation.error instanceof Error
                ? settlementSyncMutation.error.message
                : "We couldn't sync settlements right now."}
            </div>
          ) : null}

          <Card className="mb-8 border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Daily Payout Batches
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  Manual payout queue
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                  Review prepared payout batches, confirm transfers as settled,
                  or reopen a batch back to processing when needed.
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  The report auto-loads when you change the date or batch status.
                  It opens on the previous day by default so yesterday&apos;s
                  settlements are ready immediately.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Date
                  </span>
                  <input
                    type="date"
                    value={payoutDate}
                    onChange={(event) => setPayoutDate(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition [color-scheme:light] focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:[color-scheme:dark]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Batch Status
                  </span>
                  <select
                    value={payoutStatus}
                    onChange={(event) =>
                      setPayoutStatus(
                        event.target.value as "processing" | "settled" | "all",
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition [color-scheme:light] focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:[color-scheme:dark]"
                  >
                    <option value="processing">Processing</option>
                    <option value="settled">Settled</option>
                    <option value="all">All</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Organizer Filter
                  </span>
                  <input
                    list="admin-organizer-options"
                    value={organizerFilterText}
                    onChange={(event) => handleOrganizerFilterInput(event.target.value)}
                    placeholder="Search organizer name"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
              </div>
            </div>

            {payoutReportQuery.isError ? (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {payoutReportQuery.error instanceof Error
                  ? payoutReportQuery.error.message
                  : "We couldn't load the daily payout report right now."}
              </div>
            ) : null}

            {payoutReportQuery.data ? (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Ready To Pay</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {formatCurrency(payoutReportQuery.data.summary.totalReadyToPay)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Processing Batches</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {formatNumber(payoutReportQuery.data.summary.totalProcessing)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Settled Today</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {formatCurrency(payoutReportQuery.data.summary.totalSettledToday)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Batches</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {formatNumber(payoutReportQuery.data.summary.totalBatches)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Orders</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {formatNumber(payoutReportQuery.data.summary.totalOrders)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {payoutReportQuery.data.batches.length ? (
                    payoutReportQuery.data.batches.map((batch) => {
                      const isMutating =
                        toggleBatchMutation.isPending &&
                        toggleBatchMutation.variables?.batchId === batch.batchId;

                      return (
                        <div
                          key={batch.batchId}
                          className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-bold text-slate-950 dark:text-white">
                                {batch.event.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {batch.organizer.name}
                                {batch.organizer.slug ? ` | @${batch.organizer.slug}` : ""}
                              </p>
                              <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">
                                {batch.batchId}
                              </p>
                            </div>
                            <StatusPill tone={batch.status === "settled" ? "emerald" : "amber"}>
                              {batch.status}
                            </StatusPill>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total Payout</p>
                              <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                                {formatCurrency(batch.totalPayout)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Order Count</p>
                              <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                                {formatNumber(batch.orderCount)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <p>Event date: {formatDateTime(batch.event.date)}</p>
                            <p>Prepared at: {formatDateTime(batch.preparedAt)}</p>
                            <p>Settlement date: {formatDateTime(batch.settlementDate)}</p>
                            <p>
                              Bank: {batch.bankDetails?.bankName || "No bank name"}{" "}
                              {batch.bankDetails?.accountNumber
                                ? `| ${batch.bankDetails.accountNumber}`
                                : ""}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                toggleBatchMutation.mutate({
                                  batchId: batch.batchId,
                                  settled: batch.status !== "settled",
                                })
                              }
                              disabled={isMutating}
                              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                            >
                              {isMutating
                                ? "Updating..."
                                : batch.status === "settled"
                                  ? "Reopen Batch"
                                  : "Mark Settled"}
                            </button>
                            <Link
                              href={`/dashboard/admin/events/${batch.event.id}`}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                              Open Event
                              <LuArrowUpRight className="text-base" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 xl:col-span-2">
                      No payout batches found for this date and filter.
                    </div>
                  )}
                </div>

                {toggleBatchMutation.isError ? (
                  <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {toggleBatchMutation.error instanceof Error
                      ? toggleBatchMutation.error.message
                      : "We couldn't update that batch right now."}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-6 text-sm text-slate-600 dark:text-slate-300">
                Loading payout report...
              </div>
            )}
          </Card>

          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <datalist id="admin-organizer-options">
              {organizerOptions.map((organizer) => (
                <option key={organizer.id} value={organizer.name} />
              ))}
            </datalist>
            <datalist id="admin-event-options">
              {eventOptions.map((event) => (
                <option key={event.id} value={event.title} />
              ))}
            </datalist>
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_200px_220px_220px_auto]">
              <label className="relative block">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setSearch(nextValue);
                    setPage(1);
                    updateListUrl({ search: nextValue, page: 1 });
                  }}
                  placeholder="Search buyer or reference"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </label>
              <select
                value={paymentStatus}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setPaymentStatus(nextValue);
                  setPage(1);
                  updateListUrl({ paymentStatus: nextValue, page: 1 });
                }}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={settlementStatus}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSettlementStatus(nextValue);
                  setPage(1);
                  updateListUrl({ settlementStatus: nextValue, page: 1 });
                }}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="all">All settlements</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="settled">Settled</option>
                <option value="failed">Failed</option>
              </select>
              <input
                list="admin-event-options"
                value={eventFilterText}
                onChange={(event) => handleEventFilterInput(event.target.value)}
                placeholder="Search event name"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <input
                list="admin-organizer-options"
                value={organizerFilterText}
                onChange={(event) => handleOrganizerFilterInput(event.target.value)}
                placeholder="Search organizer name"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPaymentStatus("all");
                  setSettlementStatus("all");
                  setEventId("");
                  setOrganizerId("");
                  setEventFilterText("");
                  setOrganizerFilterText("");
                  setPage(1);
                  updateListUrl({
                    search: "",
                    paymentStatus: "all",
                    settlementStatus: "all",
                    eventId: "",
                    organizerId: "",
                    page: 1,
                  });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuFilterX className="text-base" />
                Reset
              </button>
            </div>
          </Card>

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
                onClick={() =>
                  setPage((current) => {
                    const nextPage = Math.max(1, current - 1);
                    updateListUrl({ page: nextPage });
                    return nextPage;
                  })
                }
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
                  setPage((current) => {
                    const nextPage = Math.min(pagination.totalPages || current, current + 1);
                    updateListUrl({ page: nextPage });
                    return nextPage;
                  })
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

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LuCheck,
  LuCopy,
  LuRefreshCw,
  LuSearch,
  LuTicket,
  LuX,
} from "react-icons/lu";

import Card from "@/components/Card";
import { getOrderStatus, getOrderTickets } from "@/helpers/organizer-api";

function OrderStatusLookupClient({
  initialOrderId = "",
}: {
  initialOrderId?: string;
}) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);
  const [copied, setCopied] = useState(false);

  const orderStatusQuery = useQuery({
    queryKey: ["public-order-status", activeOrderId],
    queryFn: () => getOrderStatus(activeOrderId),
    enabled: Boolean(activeOrderId),
    retry: false,
  });

  const ticketsQuery = useQuery({
    queryKey: ["public-order-tickets", activeOrderId],
    queryFn: () => getOrderTickets(activeOrderId),
    enabled: Boolean(activeOrderId) && orderStatusQuery.data?.orderStatus.isPaid,
    retry: false,
  });

  const paymentLabel = useMemo(() => {
    if (!orderStatusQuery.data?.orderStatus) return "";
    return orderStatusQuery.data.orderStatus.isPaid
      ? "Payment successful"
      : "Payment not successful";
  }, [orderStatusQuery.data?.orderStatus]);

  async function handleCopyOrderId() {
    if (!activeOrderId) return;

    try {
      await navigator.clipboard.writeText(activeOrderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Check Payment Status
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Enter your order ID to check whether payment went through and view your ticket details.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={orderIdInput}
              onChange={(event) => setOrderIdInput(event.target.value)}
              placeholder="Enter order ID"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setActiveOrderId(orderIdInput.trim())}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              <LuSearch className="text-base" />
              Check
            </button>
          </div>

          {activeOrderId ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                  ORDER ID
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {activeOrderId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuCopy className="text-base" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          ) : null}

          {!activeOrderId ? null : orderStatusQuery.isLoading ? (
            <div className="mt-6 rounded-2xl border border-purple-200/70 bg-white/70 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Checking your payment status...
            </div>
          ) : orderStatusQuery.error || !orderStatusQuery.data ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
              {orderStatusQuery.error instanceof Error
                ? orderStatusQuery.error.message
                : "We couldn't find that order right now."}
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-purple-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                      PAYMENT UPDATE
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {paymentLabel}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {orderStatusQuery.data.orderStatus.isPaid
                        ? "Your payment has been confirmed and your ticket is ready."
                        : "This order has not been marked as paid yet."}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      orderStatusQuery.data.orderStatus.isPaid
                        ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300"
                        : "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-300"
                    }`}
                  >
                    {orderStatusQuery.data.orderStatus.isPaid ? (
                      <LuCheck className="text-sm" />
                    ) : (
                      <LuX className="text-sm" />
                    )}
                    {orderStatusQuery.data.orderStatus.paymentStatus}
                  </span>
                </div>
              </div>

              {orderStatusQuery.data.orderStatus.isPaid ? (
                <div className="mt-6 rounded-2xl border border-purple-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                        TICKETS
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                        {ticketsQuery.data?.tickets.length ?? 0} ticket
                        {(ticketsQuery.data?.tickets.length ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void orderStatusQuery.refetch();
                        void ticketsQuery.refetch();
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <LuRefreshCw className="text-base" />
                      Refresh
                    </button>
                  </div>

                  {ticketsQuery.isLoading ? (
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                      Loading your ticket details...
                    </div>
                  ) : ticketsQuery.error ? (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
                      {ticketsQuery.error instanceof Error
                        ? ticketsQuery.error.message
                        : "We couldn't load your ticket details."}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {(ticketsQuery.data?.tickets ?? []).map((ticket) => (
                        <div
                          key={ticket.ticketCode}
                          className="rounded-2xl border border-purple-200/70 bg-purple-50/60 p-4 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                TICKET CODE
                              </p>
                              <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900 dark:text-white">
                                {ticket.ticketCode}
                              </p>
                            </div>

                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                              <LuTicket className="text-sm" />
                              {ticket.status}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                ATTENDEE
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                {ticket.buyerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                EMAIL
                              </p>
                              <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-white">
                                {ticket.buyerEmail}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}

export default OrderStatusLookupClient;

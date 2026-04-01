"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LuCopy } from "react-icons/lu";

import Card from "@/components/Card";
import { getOrderByPaymentReference } from "@/helpers/organizer-api";

function RootPaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("We are confirming your payment...");
  const [resolvedOrderId, setResolvedOrderId] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopyOrderId() {
    if (!resolvedOrderId) return;

    try {
      await navigator.clipboard.writeText(resolvedOrderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function finalizePayment() {
      if (typeof window === "undefined") return;

      const organizer = sessionStorage.getItem("zentry:lastOrganizerSlug");
      const fallbackOrderId = sessionStorage.getItem("zentry:lastOrderId");
      const fallbackEventId = sessionStorage.getItem("zentry:lastEventId");
      const reference =
        searchParams.get("reference") || searchParams.get("trxref") || "";

      if (!organizer) {
        if (!cancelled) {
          setMessage(
            "We could not open your ticket page automatically. Please return to the event page and check your payment there.",
          );
        }
        return;
      }

      let orderId = fallbackOrderId || "";
      let eventId = fallbackEventId || "";

      if (reference) {
        try {
          const lookup = await getOrderByPaymentReference(reference);
          orderId = lookup.order.id;
          eventId = lookup.order.eventId;
          if (!cancelled) {
            setResolvedOrderId(orderId);
          }

          sessionStorage.setItem("zentry:lastOrderId", orderId);
          sessionStorage.setItem("zentry:lastEventId", eventId);
          sessionStorage.setItem("zentry:lastPaymentReference", reference);
        } catch {
          // Fall back to the last browser session checkout details when lookup fails.
        }
      }

      if (!cancelled && orderId) {
        setResolvedOrderId(orderId);
      }

      if (!orderId || !eventId) {
        if (!cancelled) {
          setMessage(
            "We could not open your ticket page automatically yet. You can copy your order ID and check the payment status manually.",
          );
        }
        return;
      }

      router.replace(
        `/${organizer}/events/${eventId}/checkout/success?orderId=${encodeURIComponent(orderId)}${reference ? `&reference=${encodeURIComponent(reference)}` : ""}`,
      );
    }

    finalizePayment();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-16">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Payment Processing
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>

          {resolvedOrderId ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                ORDER ID
              </p>
              <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-900 dark:text-white">
                {resolvedOrderId}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <LuCopy className="text-base" />
                  {copied ? "Copied" : "Copy Order ID"}
                </button>

                <Link
                  href={`/payments/order-status?orderId=${encodeURIComponent(resolvedOrderId)}`}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Check Payment Status
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Back Home
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default RootPaymentCallbackClient;

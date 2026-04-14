"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LuCopy, LuRefreshCw } from "react-icons/lu";

import Card from "@/components/Card";
import {
  getPaymentReferenceFromSearchParams,
  getStoredCheckoutContext,
  storeOrderAccessContext,
} from "@/helpers/order-access";
import { getOrderByPaymentReference } from "@/helpers/organizer-api";

function OrganizerPaymentCallbackClient({
  organizer,
}: {
  organizer: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storedContext] = useState(() =>
    typeof window === "undefined"
      ? {
          orderId: "",
          organizerSlug: "",
          eventId: "",
          paymentReference: "",
          accessToken: "",
          buyerEmail: "",
        }
      : getStoredCheckoutContext(),
  );
  const [message, setMessage] = useState(
    "We received your checkout return and are routing you back to your ticket page.",
  );
  const [resolvedOrderId, setResolvedOrderId] = useState(storedContext.orderId || "");
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

      const reference = getPaymentReferenceFromSearchParams(searchParams);
      const fallbackOrderId = storedContext.orderId;
      const fallbackEventId = storedContext.eventId;

      if (!cancelled && fallbackOrderId) {
        setResolvedOrderId(fallbackOrderId);
      }

      let orderId = fallbackOrderId || "";
      let eventId = fallbackEventId || "";

      if (reference) {
        try {
          const lookup = await getOrderByPaymentReference(reference, {
            accessToken: storedContext.accessToken,
            buyerEmail: storedContext.buyerEmail,
          });
          orderId = lookup.order.id;
          eventId = lookup.order.eventId || "";
          if (!cancelled) {
            setResolvedOrderId(orderId);
          }

          storeOrderAccessContext({
            orderId,
            organizerSlug: organizer,
            eventId,
            paymentReference: reference,
            accessToken: storedContext.accessToken,
            buyerEmail: lookup.order.buyerEmail || storedContext.buyerEmail,
          });
        } catch {
          // Fall back to the last local checkout details.
        }
      }

      if (!cancelled && orderId) {
        setResolvedOrderId(orderId);
      }

      if (!orderId || !eventId) {
        if (!cancelled) {
          setMessage(
            fallbackOrderId
              ? "We couldn't finish the redirect automatically, but your order ID is ready below so you can continue from the order status page."
              : "We couldn't finish the redirect automatically yet. You can continue from the order status page below.",
          );
        }
        return;
      }

      if (!cancelled) {
        setMessage("Checkout return confirmed. Taking you to your ticket status page now...");
      }

      router.replace(
        `/${organizer}/events/${eventId}/checkout/success?orderId=${encodeURIComponent(orderId)}${reference ? `&reference=${encodeURIComponent(reference)}` : ""}`,
      );

      if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
        window.setTimeout(() => {
          window.close();
        }, 1200);
      }
    }

    finalizePayment();

    return () => {
      cancelled = true;
    };
  }, [organizer, router, searchParams, storedContext]);

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-16">
        <Card className="w-full border-purple-200/70 bg-white/95 p-8 shadow-xl shadow-purple-950/5 dark:border-white/8 dark:bg-slate-950/88 dark:shadow-black/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-700 ring-1 ring-purple-500/15 dark:bg-purple-500/15 dark:text-purple-300">
            <LuRefreshCw className="animate-spin text-2xl" />
          </div>

          <h1 className="mt-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Returning to Ticket Status
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>

          {resolvedOrderId ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
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
                  View Order Status
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-center">
            <Link
              href={`/${organizer}/events`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Back to Events
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default OrganizerPaymentCallbackClient;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Card from "@/components/Card";
import { getOrderByPaymentReference } from "@/helpers/organizer-api";

function RootPaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("We are confirming your payment...");

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

          sessionStorage.setItem("zentry:lastOrderId", orderId);
          sessionStorage.setItem("zentry:lastEventId", eventId);
          sessionStorage.setItem("zentry:lastPaymentReference", reference);
        } catch {
          // Fall back to the last browser session checkout details when lookup fails.
        }
      }

      if (!orderId || !eventId) {
        if (!cancelled) {
          setMessage(
            "We could not find your payment details yet. Please return to the events page and try again in a moment.",
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

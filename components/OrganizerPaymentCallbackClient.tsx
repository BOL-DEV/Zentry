"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Card from "@/components/Card";

function OrganizerPaymentCallbackClient({
  organizer,
}: {
  organizer: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message] = useState(() => {
    if (typeof window === "undefined") return "Finalizing your payment...";

    const reference =
      new URLSearchParams(window.location.search).get("reference") ||
      new URLSearchParams(window.location.search).get("trxref") ||
      "";
    const lastOrderId = sessionStorage.getItem("eventflow:lastOrderId");
    const lastEventId = sessionStorage.getItem("eventflow:lastEventId");
    const lastPaymentReference = sessionStorage.getItem(
      "eventflow:lastPaymentReference",
    );

    if (!lastOrderId || !lastEventId) {
      return "We couldn't recover your order details from this browser session. Please return to your events page and refresh your order status there.";
    }

    if (reference && lastPaymentReference && reference !== lastPaymentReference) {
      return "The payment reference from Paystack doesn't match the last checkout in this browser session, so we couldn't auto-open the order.";
    }

    return "Finalizing your payment...";
  });

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref") || "";

    if (typeof window === "undefined") return;

    const lastOrderId = sessionStorage.getItem("eventflow:lastOrderId");
    const lastEventId = sessionStorage.getItem("eventflow:lastEventId");
    const lastPaymentReference = sessionStorage.getItem(
      "eventflow:lastPaymentReference",
    );

    if (!lastOrderId || !lastEventId) {
      return;
    }

    if (reference && lastPaymentReference && reference !== lastPaymentReference) {
      return;
    }

    const successUrl = `/${organizer}/events/${lastEventId}/checkout/success?orderId=${encodeURIComponent(lastOrderId)}${reference ? `&reference=${encodeURIComponent(reference)}` : ""}`;
    router.replace(successUrl);
  }, [organizer, router, searchParams]);

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-16">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Payment Callback
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>

          <div className="mt-6">
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

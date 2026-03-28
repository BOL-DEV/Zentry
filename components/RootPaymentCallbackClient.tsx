"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Card from "@/components/Card";

function RootPaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message] = useState(() => {
    if (typeof window === "undefined") return "Finalizing your payment...";

    const organizer = sessionStorage.getItem("eventflow:lastOrganizerSlug");
    const orderId = sessionStorage.getItem("eventflow:lastOrderId");

    if (!organizer || !orderId) {
      return "We couldn't recover your organizer or order details from this browser session.";
    }

    return "Finalizing your payment...";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const organizer = sessionStorage.getItem("eventflow:lastOrganizerSlug");
    const orderId = sessionStorage.getItem("eventflow:lastOrderId");
    const eventId = sessionStorage.getItem("eventflow:lastEventId");
    const reference =
      searchParams.get("reference") || searchParams.get("trxref") || "";

    if (!organizer || !orderId || !eventId) return;

    const successUrl = `/${organizer}/events/${eventId}/checkout/success?orderId=${encodeURIComponent(orderId)}${reference ? `&reference=${encodeURIComponent(reference)}` : ""}`;
    router.replace(successUrl);
  }, [router, searchParams]);

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

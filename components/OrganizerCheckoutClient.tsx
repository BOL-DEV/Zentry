"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LuArrowLeft } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { formatCurrency } from "@/helpers/format";
import {
  createPurchase,
  getOrganizerEventDetails,
  initializeOrderPayment,
} from "@/helpers/organizer-api";

function OrganizerCheckoutClient({
  organizer,
  eventId,
}: {
  organizer: string;
  eventId: string;
}) {
  const searchParams = useSearchParams();
  const requestedTicketTypeId = searchParams.get("ticketTypeId");

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-checkout-event", organizer, eventId],
    queryFn: () => getOrganizerEventDetails(organizer, eventId),
  });

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedTicketId = useMemo(() => {
    if (ticketTypeId) return ticketTypeId;
    if (!data?.event.ticketTypes.length) return "";

    const requestedType = data.event.ticketTypes.find(
      (ticket) => ticket.id === requestedTicketTypeId,
    );
    const defaultType =
      requestedType ??
      data.event.ticketTypes.find((ticket) => ticket.isActive !== false) ??
      data.event.ticketTypes[0];

    return defaultType?.id || "";
  }, [data, requestedTicketTypeId, ticketTypeId]);

  const selectedTicket = useMemo(() => {
    return data?.event.ticketTypes.find((ticket) => ticket.id === selectedTicketId);
  }, [data, selectedTicketId]);

  const subtotal = (selectedTicket?.price ?? 0) * quantity;
  const total = subtotal;
  const maxQuantity = Math.min(10, selectedTicket?.remaining ?? 1);

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicket?.id) {
        throw new Error("Choose a ticket type before continuing.");
      }

      const purchase = await createPurchase(organizer, eventId, {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim() || undefined,
        items: [{ ticketTypeId: selectedTicket.id, quantity }],
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("eventflow:lastOrderId", purchase.order.id);
        sessionStorage.setItem("eventflow:lastOrganizerSlug", organizer);
        sessionStorage.setItem("eventflow:lastEventId", eventId);
      }

      const payment = await initializeOrderPayment(purchase.order.id);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "eventflow:lastPaymentReference",
          payment.payment.reference,
        );
      }

      return payment;
    },
    onSuccess: (payment) => {
      if (typeof window !== "undefined") {
        window.location.assign(payment.payment.authorizationUrl);
      }
    },
    onError: (mutationError) => {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : "We couldn't start checkout.",
      );
    },
  });

  const inputStyles =
    "h-12 w-full rounded-xl border border-purple-200/80 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:shadow-none dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const selectStyles = `${inputStyles} pr-10`;

  if (isLoading) {
    return (
      <FullPageLoader
        title="Loading checkout"
        description="We are preparing this event and ticket options for purchase."
      />
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-4xl px-6 pt-28 pb-14">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't load checkout for this event."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const event = data.event;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-slate-950/10 via-transparent to-transparent dark:from-white/5" />

        <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
          <Link
            href={`/${organizer}/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <LuArrowLeft className="text-base" />
            Back to Event
          </Link>

          <div className="mt-8 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Secure Checkout
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Complete your ticket purchase for {event.title}
            </p>
          </div>

          <section className="mt-12 grid gap-8 lg:grid-cols-12">
            <Card className="p-8 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Attendee Information
              </h2>

              <form
                className="mt-7 space-y-5"
                id="organizer-checkout-form"
                onSubmit={(submitEvent) => {
                  submitEvent.preventDefault();
                  setFormError(null);

                  if (!buyerName.trim() || !buyerEmail.trim()) {
                    setFormError("Name and email are required.");
                    return;
                  }

                  if (!selectedTicket?.id) {
                    setFormError("Select a ticket type to continue.");
                    return;
                  }

                  checkoutMutation.mutate();
                }}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Full Name{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    value={buyerName}
                    onChange={(event) => setBuyerName(event.target.value)}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Email Address{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    required
                    value={buyerEmail}
                    onChange={(event) => setBuyerEmail(event.target.value)}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234 801 234 5678"
                    autoComplete="tel"
                    value={buyerPhone}
                    onChange={(event) => setBuyerPhone(event.target.value)}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="ticketType"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Ticket Type{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <select
                    id="ticketType"
                    name="ticketType"
                    required
                    value={selectedTicketId}
                    onChange={(event) => {
                      setTicketTypeId(event.target.value);
                      setQuantity(1);
                    }}
                    className={selectStyles}
                  >
                    {event.ticketTypes.map((ticket) => (
                      <option
                        key={ticket.id ?? ticket.name}
                        value={ticket.id}
                        disabled={ticket.isActive === false || ticket.remaining <= 0}
                      >
                        {ticket.name} - {formatCurrency(ticket.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Quantity{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    required
                    value={String(quantity)}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    className={selectStyles}
                    disabled={!selectedTicket || maxQuantity < 1}
                  >
                    {Array.from({ length: Math.max(1, maxQuantity) }, (_, index) => {
                      const value = index + 1;
                      return (
                        <option key={value} value={String(value)}>
                          {value} Ticket{value === 1 ? "" : "s"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {formError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {formError}
                  </div>
                ) : null}

              </form>
            </Card>

            <Card className="p-8 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900/90">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Order Summary
              </h2>

              <div className="mt-7 space-y-4 rounded-2xl border border-purple-200/70 bg-purple-50/60 p-5 text-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">
                    {selectedTicket?.name ?? "Ticket"}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(selectedTicket?.price ?? 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">Quantity</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    x {quantity}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">Available</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTicket?.remaining ?? 0}
                  </p>
                </div>

                <div className="my-2 h-px w-full bg-purple-200/70 dark:bg-slate-800" />

                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">Subtotal</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    Total
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                You&apos;ll be redirected to Paystack to complete payment securely.
              </p>

              <button
                type="submit"
                form="organizer-checkout-form"
                disabled={checkoutMutation.isPending || !selectedTicket}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkoutMutation.isPending
                  ? "Starting payment..."
                  : "Proceed to Payment"}
              </button>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

export default OrganizerCheckoutClient;

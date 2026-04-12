"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LuArrowLeft } from "react-icons/lu";

import Card from "@/components/Card";
import { storeOrderAccessContext } from "@/helpers/order-access";
import FullPageLoader from "@/components/FullPageLoader";
import { formatCurrency } from "@/helpers/format";
import {
  createPurchase,
  getOrganizerEventDetails,
} from "@/helpers/organizer-api";

function OrganizerCheckoutClient({
  organizer,
  eventId,
}: {
  organizer: string;
  eventId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTicketTypeId = searchParams.get("ticketTypeId");

  const { data, isLoading, error, refetch: refetchEventDetails } = useQuery({
    queryKey: ["organizer-checkout-event", organizer, eventId],
    queryFn: () => getOrganizerEventDetails(organizer, eventId),
  });

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const selectableTicketTypes = useMemo(() => {
    return (data?.event.ticketTypes ?? []).map((ticket) => ({
      ...ticket,
      selectedQuantity:
        ticket.id && ticketQuantities[ticket.id] !== undefined
          ? ticketQuantities[ticket.id]
          : ticket.id === requestedTicketTypeId && ticket.remaining > 0
            ? 1
            : 0,
      maxQuantity: Math.min(10, ticket.remaining),
    }));
  }, [data?.event.ticketTypes, requestedTicketTypeId, ticketQuantities]);

  const selectedItems = useMemo(() => {
    return selectableTicketTypes.filter((ticket) => ticket.selectedQuantity > 0);
  }, [selectableTicketTypes]);

  const subtotal = selectedItems.reduce(
    (sum, ticket) => sum + ticket.price * ticket.selectedQuantity,
    0,
  );
  const total = subtotal;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItems.length) {
        throw new Error("Select at least one ticket type before continuing.");
      }

      const latestEventDetails = await getOrganizerEventDetails(organizer, eventId);
      const latestTicketTypes = new Map(
        latestEventDetails.event.ticketTypes
          .filter((ticket) => ticket.id)
          .map((ticket) => [ticket.id as string, ticket]),
      );

      const items = selectedItems.map((ticket) => {
        if (!ticket.id) {
          throw new Error(
            "One or more selected ticket types could not be identified. Please refresh and try again.",
          );
        }

        const latestTicket = latestTicketTypes.get(ticket.id);
        if (!latestTicket || latestTicket.isActive === false) {
          throw new Error(
            `${ticket.name} is no longer available. Please refresh the page and select another ticket.`,
          );
        }

        if (latestTicket.remaining < ticket.selectedQuantity) {
          throw new Error(
            `${ticket.name} no longer has enough tickets available. Please reduce the quantity and try again.`,
          );
        }

        return {
          ticketTypeId: ticket.id,
          quantity: ticket.selectedQuantity,
        };
      });

      const purchase = await createPurchase(organizer, eventId, {
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        paymentGateway: "squad",
        items,
      });

      storeOrderAccessContext({
        orderId: purchase.order.id,
        organizerSlug: organizer,
        eventId,
        paymentReference: purchase.order.paymentReference || undefined,
        accessToken: purchase.order.accessToken,
        buyerEmail: purchase.order.buyerEmail || buyerEmail.trim(),
        orderSnapshot: purchase.order,
      });

      return purchase.order;
    },
    onSuccess: (order) => {
      if (typeof window !== "undefined" && order.checkoutUrl) {
        window.location.assign(order.checkoutUrl);
        return;
      }

      router.replace(
        `/${organizer}/events/${eventId}/checkout/success?orderId=${encodeURIComponent(order.id)}${order.paymentReference ? `&reference=${encodeURIComponent(order.paymentReference)}` : ""}`,
      );
    },
    onError: (mutationError) => {
      void refetchEventDetails();
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

                  if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
                    setFormError("Name, email, and phone number are required.");
                    return;
                  }

                  if (!selectedItems.length) {
                    setFormError("Select at least one ticket type to continue.");
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
                    <span className="text-purple-600 dark:text-purple-400">
                      *
                    </span>
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
                    <span className="text-purple-600 dark:text-purple-400">
                      *
                    </span>
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
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                      Ticket Types{" "}
                      <span className="text-purple-600 dark:text-purple-400">
                        *
                      </span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Choose one or more ticket types
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectableTicketTypes.map((ticket) => {
                      const disabled =
                        ticket.isActive === false || ticket.maxQuantity < 1;

                      return (
                        <div
                          key={ticket.id ?? ticket.name}
                          className="rounded-2xl border border-purple-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/70"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {ticket.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                {formatCurrency(ticket.price)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {ticket.remaining} available
                              </p>
                            </div>

                            <div className="w-full sm:w-40">
                              <label
                                htmlFor={`ticket-quantity-${ticket.id}`}
                                className="mb-2 block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400"
                              >
                                Quantity
                              </label>
                              <select
                                id={`ticket-quantity-${ticket.id}`}
                                value={String(ticket.selectedQuantity)}
                                onChange={(event) => {
                                  const nextQuantity = Number(event.target.value);
                                  setTicketQuantities((current) => ({
                                    ...current,
                                    [ticket.id as string]: nextQuantity,
                                  }));
                                }}
                                className={selectStyles}
                                disabled={disabled}
                              >
                                {Array.from(
                                  { length: Math.max(1, ticket.maxQuantity + 1) },
                                  (_, index) => (
                                    <option key={index} value={String(index)}>
                                      {index === 0
                                        ? "0"
                                        : `${index} Ticket${index === 1 ? "" : "s"}`}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                {selectedItems.length ? (
                  <>
                    {selectedItems.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="text-slate-900 dark:text-white">
                            {ticket.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(ticket.price)} x {ticket.selectedQuantity}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(ticket.price * ticket.selectedQuantity)}
                        </p>
                      </div>
                    ))}

                    <div className="my-2 h-px w-full bg-purple-200/70 dark:bg-slate-800" />
                  </>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300">
                    No tickets selected yet.
                  </p>
                )}

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
                We&apos;ll connect you to Squad checkout to complete payment securely.
              </p>

              <button
                type="submit"
                form="organizer-checkout-form"
                disabled={checkoutMutation.isPending || !selectedItems.length}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkoutMutation.isPending
                  ? "Creating Order..."
                  : "Continue to Squad Checkout"}
              </button>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

export default OrganizerCheckoutClient;

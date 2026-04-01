"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import { LuCheck, LuDownload, LuRefreshCw, LuX } from "react-icons/lu";

import Card from "@/components/Card";
import {
  getOrderByPaymentReference,
  getOrderStatus,
  getOrderTickets,
  getOrganizerEventDetails,
} from "@/helpers/organizer-api";
import { createTicketPayload } from "@/helpers/ticket";
import type { ApiTicket } from "@/helpers/type";

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function downloadBlob(filename: string, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

async function triggerPngDownload(filename: string, svgContent: string) {
  const svgBlob = new Blob([svgContent], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new window.Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to render ticket image."));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available in this browser.");
    }

    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Unable to export ticket image."));
      }, "image/png");
    });

    downloadBlob(filename, pngBlob);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function OrganizerCheckoutSuccessClient({ organizer }: { organizer: string }) {
  const [callbackContext] = useState(() => {
    if (typeof window === "undefined") {
      return {
        orderId: "",
        paymentReference: "",
        fallbackEventId: "",
      };
    }

    const params = new URLSearchParams(window.location.search);
    return {
      orderId:
        params.get("orderId") || sessionStorage.getItem("zentry:lastOrderId") || "",
      paymentReference:
        params.get("reference") ||
        params.get("trxref") ||
        sessionStorage.getItem("zentry:lastPaymentReference") ||
        "",
      fallbackEventId: sessionStorage.getItem("zentry:lastEventId") || "",
    };
  });

  const orderLookupQuery = useQuery({
    queryKey: ["order-by-payment-reference", callbackContext.paymentReference],
    queryFn: () => getOrderByPaymentReference(callbackContext.paymentReference),
    enabled: !callbackContext.orderId && Boolean(callbackContext.paymentReference),
    retry: false,
  });

  const resolvedOrderId = callbackContext.orderId || orderLookupQuery.data?.order.id || "";
  const resolvedEventId =
    orderLookupQuery.data?.order.eventId || callbackContext.fallbackEventId;

  const orderStatusQuery = useQuery({
    queryKey: ["order-status", resolvedOrderId],
    queryFn: () => getOrderStatus(resolvedOrderId),
    enabled: Boolean(resolvedOrderId),
    retry: false,
    refetchInterval: (query) => {
      if (!resolvedOrderId) return false;
      if (query.state.data?.orderStatus?.isPaid) return false;
      if (query.state.data?.orderStatus?.paymentStatus === "cancelled") return false;
      return 4000;
    },
  });

  const ticketsQuery = useQuery({
    queryKey: ["order-tickets", resolvedOrderId],
    queryFn: () => getOrderTickets(resolvedOrderId),
    enabled:
      Boolean(resolvedOrderId) &&
      (orderStatusQuery.data?.orderStatus.isPaid ||
        (!orderStatusQuery.isLoading && orderStatusQuery.isError)),
    retry: false,
    refetchInterval: (query) => {
      if (!resolvedOrderId) return false;
      if (!orderStatusQuery.data?.orderStatus.isPaid) return false;
      if (query.state.data?.tickets?.length) return false;
      return 3000;
    },
  });

  const data = ticketsQuery.data;
  const isLoading =
    orderLookupQuery.isLoading ||
    (Boolean(resolvedOrderId) && orderStatusQuery.isLoading && !data);
  const error = orderLookupQuery.error || orderStatusQuery.error || ticketsQuery.error;

  const eventId = data?.tickets?.[0]?.eventId ?? resolvedEventId;
  const { data: eventDetails } = useQuery({
    queryKey: ["success-event-details", organizer, eventId],
    queryFn: () => getOrganizerEventDetails(organizer, eventId),
    enabled: Boolean(eventId),
  });

  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [showEmailNotice, setShowEmailNotice] = useState(false);
  const hasShownEmailNoticeRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function generateQrs() {
      if (!data?.tickets?.length) return;

      const entries = await Promise.all(
        data.tickets.map(async (ticket) => {
          const payload = createTicketPayload(ticket.eventId, ticket.ticketCode);
          const qr = await QRCode.toDataURL(payload, { margin: 1, scale: 7 });
          return [ticket.ticketCode, qr] as const;
        }),
      );

      if (isMounted) {
        setQrCodeMap(Object.fromEntries(entries));
      }
    }

    generateQrs();

    return () => {
      isMounted = false;
    };
  }, [data]);

  useEffect(() => {
    if (!data?.tickets?.length || hasShownEmailNoticeRef.current) return;

    hasShownEmailNoticeRef.current = true;
    const timeoutId = window.setTimeout(() => {
      setShowEmailNotice(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [data?.tickets?.length]);

  const ticketTypeById = useMemo(() => {
    return new Map(
      (eventDetails?.event.ticketTypes ?? []).map((ticketType) => [
        ticketType.id,
        ticketType.name,
      ]),
    );
  }, [eventDetails]);

  async function handleDownloadTicketImage(ticket: ApiTicket) {
    const qrCodeSrc = qrCodeMap[ticket?.ticketCode];
    if (!qrCodeSrc || !data) return;

    const eventTitle = escapeSvgText(
      eventDetails?.event.title ?? "Zentry Ticket",
    );
    const ticketType = escapeSvgText(
      ticketTypeById.get(ticket.ticketTypeId) ?? "Ticket",
    );
    const attendeeName = escapeSvgText(ticket.buyerName);
    const attendeeEmail = escapeSvgText(ticket.buyerEmail);
    const ticketCode = escapeSvgText(ticket.ticketCode);
    const ticketStatus = escapeSvgText(ticket.status.toUpperCase());
    const orderReference = escapeSvgText(
      data.order.paymentReference || data.order.id,
    );

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090b23" />
      <stop offset="100%" stop-color="#171a31" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#bg)" />
  <rect x="90" y="90" width="900" height="1170" rx="34" fill="#232638" stroke="#3c415d" stroke-width="2" />
  <text x="140" y="170" fill="#93a0bb" font-size="28" font-family="Arial, sans-serif">ZENTRY TICKET</text>
  <circle cx="858" cy="156" r="10" fill="#14d991" />
  <rect x="810" y="126" width="120" height="56" rx="28" fill="#123e38" />
  <text x="870" y="162" text-anchor="middle" fill="#14d991" font-size="30" font-weight="700" font-family="Arial, sans-serif">${ticketStatus}</text>

  <text x="140" y="250" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">EVENT</text>
  <text x="140" y="305" fill="#ffffff" font-size="54" font-weight="700" font-family="Arial, sans-serif">${eventTitle}</text>

  <text x="140" y="395" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">TICKET TYPE</text>
  <text x="140" y="445" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, sans-serif">${ticketType}</text>

  <text x="560" y="395" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ATTENDEE NAME</text>
  <text x="560" y="445" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, sans-serif">${attendeeName}</text>

  <text x="140" y="535" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ATTENDEE EMAIL</text>
  <text x="140" y="585" fill="#ffffff" font-size="32" font-family="Arial, sans-serif">${attendeeEmail}</text>

  <text x="140" y="675" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ORDER REFERENCE</text>
  <text x="140" y="725" fill="#ffffff" font-size="34" font-family="Arial, sans-serif">${orderReference}</text>

  <rect x="140" y="790" width="390" height="170" rx="26" fill="#2b3046" />
  <text x="180" y="850" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">TICKET CODE</text>
  <text x="180" y="915" fill="#ffffff" font-size="44" font-weight="700" font-family="Courier New, monospace">${ticketCode}</text>

  <rect x="620" y="760" width="300" height="300" rx="28" fill="#ffffff" />
  <image href="${qrCodeSrc}" x="650" y="790" width="240" height="240" />

  <text x="140" y="1130" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">Keep this ticket image safe. It contains your QR code for entry.</text>
</svg>`.trim();

    await triggerPngDownload(`${ticket.ticketCode}.png`, svg);
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-slate-950/10 via-transparent to-transparent dark:from-white/5" />
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" />

        <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
          <Card className="w-full p-10">
            {showEmailNotice ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">Tickets sent to your email</p>
                    <p className="mt-1 text-emerald-800 dark:text-emerald-100/90">
                      A copy of your ticket has been sent to {data?.order.buyerEmail}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEmailNotice(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-100 dark:hover:bg-emerald-500/10"
                    aria-label="Close email notice"
                  >
                    <LuX className="text-base" />
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <LuCheck className="text-2xl text-emerald-400" />
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Payment Update
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {resolvedOrderId || callbackContext.paymentReference
                  ? "We are checking your payment and preparing your tickets."
                  : "We could not find your payment details yet. Please start again from the event page."}
              </p>
            </div>

            {!resolvedOrderId && !callbackContext.paymentReference ? (
              <div className="mt-8">
                <Link
                  href={`/${organizer}/events`}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-purple-200/70 bg-white/60 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Back to Events
                </Link>
              </div>
            ) : isLoading ? (
              <div className="mt-8 rounded-2xl border border-purple-200/70 bg-white/70 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Confirming your payment and getting your tickets ready...
              </div>
            ) : error || !data?.tickets?.length ? (
              <div className="mt-8 space-y-4 rounded-2xl border border-purple-200/70 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {error instanceof Error
                    ? error.message
                    : orderStatusQuery.data?.orderStatus.paymentStatus ===
                        "cancelled"
                      ? "This payment was cancelled, so no tickets were created."
                      : orderStatusQuery.data?.orderStatus.isPaid
                        ? "Your payment was successful. We are still finishing up your ticket details."
                        : "Your payment is still being processed. Tickets usually appear shortly after confirmation."}
                </p>

                {orderStatusQuery.data?.orderStatus ? (
                  <div className="rounded-xl border border-purple-200/70 bg-purple-50/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Current status:{" "}
                      {orderStatusQuery.data.orderStatus.paymentStatus}
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      Payment reference:{" "}
                      {orderStatusQuery.data.orderStatus.paymentReference ||
                        callbackContext.paymentReference ||
                        "Unavailable"}
                    </p>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    void orderLookupQuery.refetch();
                    void orderStatusQuery.refetch();
                    void ticketsQuery.refetch();
                  }}
                  disabled={
                    orderLookupQuery.isFetching ||
                    orderStatusQuery.isFetching ||
                    ticketsQuery.isFetching
                  }
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-70"
                >
                  <LuRefreshCw className="text-base" />
                  {orderLookupQuery.isFetching ||
                  orderStatusQuery.isFetching ||
                  ticketsQuery.isFetching
                    ? "Refreshing..."
                    : "Check Again"}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {data.tickets.length} ticket
                    {data.tickets.length === 1 ? "" : "s"} generated for{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {data.order.buyerName}
                    </span>
                  </p>
                </div>

                <div className="mt-8 max-h-[26rem] space-y-4 overflow-y-auto pr-2">
                  {data.tickets.map((ticket, index) => (
                    <div
                      key={ticket.ticketCode}
                      className="overflow-hidden rounded-3xl border border-purple-200/70 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="h-1.5 w-full bg-linear-to-r from-cyan-400 via-purple-500 to-emerald-400" />

                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase dark:text-slate-400">
                              TICKET {index + 1} OF {data.tickets.length}
                            </p>
                            <p className="mt-2 text-lg font-semibold leading-tight text-slate-900 sm:text-xl dark:text-white">
                              {eventDetails?.event.title ?? "Zentry Ticket"}
                            </p>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              Present this ticket at entry for a quick check-in.
                            </p>
                          </div>

                          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {ticket.status}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                          <div className="rounded-2xl border border-purple-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                  TICKET TYPE
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                  {ticketTypeById.get(ticket.ticketTypeId) ??
                                    "Ticket"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                  ATTENDEE NAME
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                  {ticket.buyerName}
                                </p>
                              </div>

                              <div className="sm:col-span-2">
                                <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                  ATTENDEE EMAIL
                                </p>
                                <p className="mt-1 break-all text-sm leading-6 font-semibold text-slate-900 dark:text-white">
                                  {ticket.buyerEmail}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-purple-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                            {qrCodeMap[ticket.ticketCode] ? (
                              <div className="flex justify-center">
                                <Image
                                  src={qrCodeMap[ticket.ticketCode]}
                                  alt={`QR code for ${ticket.ticketCode}`}
                                  width={192}
                                  height={192}
                                  unoptimized
                                  className="h-auto w-40 rounded-2xl bg-white p-3 shadow-sm sm:w-44"
                                />
                              </div>
                            ) : (
                              <div className="flex min-h-40 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                                Preparing QR code...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-dashed border-purple-200/70 bg-purple-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                          <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                            TICKET CODE
                          </p>
                          <p className="mt-2 break-all font-mono text-base font-bold tracking-[0.22em] text-slate-900 sm:text-lg dark:text-white">
                            {ticket.ticketCode}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadTicketImage(ticket)}
                          disabled={!qrCodeMap[ticket.ticketCode]}
                          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white/95 dark:hover:bg-white"
                        >
                          <LuDownload className="text-base" />
                          Download Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      void orderStatusQuery.refetch();
                      void ticketsQuery.refetch();
                    }}
                    disabled={
                      orderStatusQuery.isFetching || ticketsQuery.isFetching
                    }
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-purple-200/70 bg-white/60 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <LuRefreshCw className="text-base" />
                    {orderStatusQuery.isFetching || ticketsQuery.isFetching
                      ? "Refreshing..."
                      : "Check for Updates"}
                  </button>

                  <Link
                    href={`/${organizer}/events`}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-purple-200/70 bg-white/60 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-purple-400/20"
                  >
                    <LuX className="text-base" />
                    Close
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default OrganizerCheckoutSuccessClient;

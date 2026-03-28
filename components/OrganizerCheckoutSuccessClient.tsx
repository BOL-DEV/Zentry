"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import { LuCheck, LuDownload, LuRefreshCw, LuX } from "react-icons/lu";

import Card from "@/components/Card";
import {
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
  const [orderId] = useState(() => {
    if (typeof window === "undefined") return "";

    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("orderId");
    const fromStorage = sessionStorage.getItem("eventflow:lastOrderId");
    return fromQuery || fromStorage || "";
  });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["order-tickets", orderId],
    queryFn: () => getOrderTickets(orderId),
    enabled: Boolean(orderId),
    retry: false,
    refetchInterval: (query) => {
      if (!orderId) return false;
      if (query.state.data?.tickets?.length) return false;
      return 5000;
    },
  });

  const eventId = data?.tickets?.[0]?.eventId ?? "";
  const { data: eventDetails } = useQuery({
    queryKey: ["success-event-details", organizer, eventId],
    queryFn: () => getOrganizerEventDetails(organizer, eventId),
    enabled: Boolean(eventId),
  });

  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});

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
      eventDetails?.event.title ?? "EventFlow Ticket",
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
  <text x="140" y="170" fill="#93a0bb" font-size="28" font-family="Arial, sans-serif">EVENTFLOW TICKET</text>
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <LuCheck className="text-2xl text-emerald-400" />
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Order Status
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {orderId
                  ? "We're checking the payment result and generated tickets."
                  : "We couldn't find an order yet. Start checkout first or return here with ?orderId=..."}
              </p>
            </div>

            {!orderId ? (
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
                Waiting for the backend to return ticket data...
              </div>
            ) : error || !data?.tickets?.length ? (
              <div className="mt-8 space-y-4 rounded-2xl border border-purple-200/70 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {error instanceof Error
                    ? error.message
                    : "Payment may still be processing. Tickets usually appear once the webhook confirms payment."}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-70"
                >
                  <LuRefreshCw className="text-base" />
                  {isFetching ? "Refreshing..." : "Refresh Order"}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {data.tickets.length} ticket{data.tickets.length === 1 ? "" : "s"} generated for{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {data.order.buyerName}
                    </span>
                  </p>
                </div>

                <div className="mt-8 max-h-[26rem] space-y-4 overflow-y-auto pr-2">
                  {data.tickets.map((ticket, index) => (
                    <div
                      key={ticket.ticketCode}
                      className="rounded-2xl border border-purple-200/70 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                            TICKET {index + 1} OF {data.tickets.length}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                            {eventDetails?.event.title ?? "EventFlow Ticket"}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {ticket.status}
                        </span>
                      </div>

                      <div className="mt-6 rounded-2xl border border-purple-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                              TICKET TYPE
                            </p>
                            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                              {ticketTypeById.get(ticket.ticketTypeId) ?? "Ticket"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                              ATTENDEE NAME
                            </p>
                            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                              {ticket.buyerName}
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                              ATTENDEE EMAIL
                            </p>
                            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                              {ticket.buyerEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-purple-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                          TICKET CODE
                        </p>
                        <p className="mt-2 font-mono text-lg font-bold tracking-widest text-slate-900 dark:text-white">
                          {ticket.ticketCode}
                        </p>
                      </div>

                      {qrCodeMap[ticket.ticketCode] ? (
                        <div className="mt-6 flex justify-center">
                          <Image
                            src={qrCodeMap[ticket.ticketCode]}
                            alt={`QR code for ${ticket.ticketCode}`}
                            width={224}
                            height={224}
                            unoptimized
                            className="h-auto w-56 rounded-2xl bg-white p-3 shadow-sm"
                          />
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDownloadTicketImage(ticket)}
                        disabled={!qrCodeMap[ticket.ticketCode]}
                        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white/95 dark:hover:bg-white"
                      >
                        <LuDownload className="text-base" />
                        Download Ticket Image
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-purple-200/70 bg-white/60 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <LuRefreshCw className="text-base" />
                    {isFetching ? "Refreshing..." : "Refresh Tickets"}
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

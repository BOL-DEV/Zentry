"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { useQuery } from "@tanstack/react-query";
import {
  LuCheck,
  LuCopy,
  LuDownload,
  LuRefreshCw,
  LuSearch,
  LuTicket,
  LuX,
} from "react-icons/lu";

import Card from "@/components/Card";
import { getStoredOrderAccessContext, storeOrderAccessContext } from "@/helpers/order-access";
import { getOrderStatus, getOrderTickets } from "@/helpers/organizer-api";
import { createTicketPayload } from "@/helpers/ticket";

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

function formatDateTime(value?: string | null) {
  if (!value) return "Unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatStatusLabel(status: "valid" | "checked-in") {
  return status === "checked-in" ? "Checked In" : "Valid for Entry";
}

function OrderStatusLookupClient({
  initialOrderId = "",
}: {
  initialOrderId?: string;
}) {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);
  const [storedAccessToken] = useState(() =>
    typeof window === "undefined"
      ? ""
      : getStoredOrderAccessContext().accessToken || "",
  );
  const [buyerEmailInput, setBuyerEmailInput] = useState(() =>
    typeof window === "undefined"
      ? ""
      : getStoredOrderAccessContext().buyerEmail || "",
  );
  const [activeBuyerEmail, setActiveBuyerEmail] = useState(() =>
    typeof window === "undefined"
      ? ""
      : getStoredOrderAccessContext().buyerEmail || "",
  );
  const [copied, setCopied] = useState(false);
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});

  const activeAccess = useMemo(
    () => ({
      accessToken: storedAccessToken || undefined,
      buyerEmail: activeBuyerEmail.trim() || undefined,
    }),
    [activeBuyerEmail, storedAccessToken],
  );

  const orderStatusQuery = useQuery({
    queryKey: ["public-order-status", activeOrderId, activeAccess.accessToken, activeAccess.buyerEmail],
    queryFn: () => getOrderStatus(activeOrderId, activeAccess),
    enabled: Boolean(activeOrderId),
    retry: false,
  });

  const ticketsQuery = useQuery({
    queryKey: ["public-order-tickets", activeOrderId, activeAccess.accessToken, activeAccess.buyerEmail],
    queryFn: () => getOrderTickets(activeOrderId, activeAccess),
    enabled: Boolean(activeOrderId) && Boolean(orderStatusQuery.data?.orderStatus?.isPaid),
    retry: false,
  });

  const paymentLabel = useMemo(() => {
    if (!orderStatusQuery.data?.orderStatus) return "";
    return orderStatusQuery.data.orderStatus.isPaid
      ? "Payment successful"
      : "Awaiting payment confirmation";
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

  useEffect(() => {
    let isMounted = true;

    async function generateQrs() {
      if (!ticketsQuery.data?.tickets?.length) return;

      const entries = await Promise.all(
        ticketsQuery.data.tickets.map(async (ticket) => {
          const payload = createTicketPayload(ticket.eventId, ticket.ticketCode);
          const qr = await QRCode.toDataURL(payload, { margin: 1, scale: 7 });
          return [ticket.ticketCode, qr] as const;
        }),
      );

      if (isMounted) {
        setQrCodeMap(Object.fromEntries(entries));
      }
    }

    void generateQrs();

    return () => {
      isMounted = false;
    };
  }, [ticketsQuery.data?.tickets]);

  async function handleDownloadTicket(
    ticket: {
      ticketCode: string;
      buyerName: string;
      buyerEmail: string;
      status: "valid" | "checked-in";
    },
  ) {
    const qrCodeSrc = qrCodeMap[ticket.ticketCode];
    if (!qrCodeSrc) return;

    const attendeeName = escapeSvgText(ticket.buyerName);
    const attendeeEmail = escapeSvgText(ticket.buyerEmail);
    const ticketCode = escapeSvgText(ticket.ticketCode);
    const ticketStatus = escapeSvgText(ticket.status.toUpperCase());
    const orderReference = escapeSvgText(activeOrderId);

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
  <text x="140" y="305" fill="#ffffff" font-size="54" font-weight="700" font-family="Arial, sans-serif">Zentry Ticket</text>

  <text x="140" y="395" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ATTENDEE NAME</text>
  <text x="140" y="445" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, sans-serif">${attendeeName}</text>

  <text x="140" y="535" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ATTENDEE EMAIL</text>
  <text x="140" y="585" fill="#ffffff" font-size="32" font-family="Arial, sans-serif">${attendeeEmail}</text>

  <text x="140" y="675" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ORDER ID</text>
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

  async function handleDownloadAllTickets() {
    const tickets = ticketsQuery.data?.tickets ?? [];
    for (const ticket of tickets) {
      // Keep downloads sequential so browsers are less likely to block them.
      await handleDownloadTicket(ticket);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f3e8ff_0%,#efe4ff_45%,#f6f1ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#050b1a_45%,#020617_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.14),_transparent_38%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.1),_transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-24">
        <Card className="border border-purple-200/70 bg-white/92 p-6 shadow-[0_28px_80px_rgba(88,28,135,0.12)] backdrop-blur dark:border-white/8 dark:bg-slate-950/88 dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Check Payment Status
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Enter your order ID and the buyer email used at checkout to check payment progress and ticket details.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={orderIdInput}
              onChange={(event) => setOrderIdInput(event.target.value)}
              placeholder="Enter order ID"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <input
              value={buyerEmailInput}
              onChange={(event) => setBuyerEmailInput(event.target.value)}
              placeholder="Buyer email"
              type="email"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <button
              type="button"
              onClick={() => {
                const nextOrderId = orderIdInput.trim();
                const nextBuyerEmail = buyerEmailInput.trim();
                setActiveOrderId(nextOrderId);
                setActiveBuyerEmail(nextBuyerEmail);
                storeOrderAccessContext({
                  orderId: nextOrderId,
                  buyerEmail: nextBuyerEmail,
                });
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              <LuSearch className="text-base" />
              Check
            </button>
          </div>

          {activeOrderId ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
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
            <div className="mt-6 rounded-3xl border border-purple-200/70 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300">
              Checking your payment status...
            </div>
          ) : orderStatusQuery.error || !orderStatusQuery.data ? (
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">
              {orderStatusQuery.error instanceof Error
                ? orderStatusQuery.error.message
                : "We couldn't find that order right now."}
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-3xl border border-purple-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
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
                        : "This order is still pending. Squad has not confirmed the payment yet, so ticket generation is still in progress."}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Reservation expires:{" "}
                      {formatDateTime(
                        orderStatusQuery.data.orderStatus.reservationExpiresAt,
                      )}
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
                <div className="mt-6 rounded-3xl border border-purple-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                        TICKETS
                      </p>
                      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                        {ticketsQuery.data?.tickets.length ?? 0} ticket
                        {(ticketsQuery.data?.tickets.length ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {(ticketsQuery.data?.tickets.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={() => void handleDownloadAllTickets()}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                        >
                          <LuDownload className="text-base" />
                          Download All
                        </button>
                      ) : null}

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
                    <div className="mt-4 space-y-4">
                      {(ticketsQuery.data?.tickets ?? []).map((ticket) => (
                        <div
                          key={ticket.ticketCode}
                          className="overflow-hidden rounded-[28px] border border-purple-200/70 bg-white/90 shadow-[0_18px_45px_rgba(88,28,135,0.08)] dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_18px_45px_rgba(0,0,0,0.32)]"
                        >
                          <div className="h-1.5 w-full bg-linear-to-r from-cyan-400 via-purple-500 to-emerald-400" />

                          <div className="p-5 sm:p-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 uppercase dark:text-slate-400">
                                  READY TICKET
                                </p>
                                <p className="mt-2 text-lg font-semibold leading-tight text-slate-900 sm:text-2xl dark:text-white">
                                  Zentry Ticket
                                </p>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                  Present this ticket at entry for a quick check-in.
                                </p>
                              </div>

                              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                                <LuTicket className="text-sm" />
                                {formatStatusLabel(ticket.status)}
                              </span>
                            </div>

                            <div className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.95fr] xl:items-start">
                              <div className="rounded-3xl border border-purple-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-slate-900/80">
                                <div className="grid gap-5 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                      TICKET CODE
                                    </p>
                                    <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900 dark:text-white">
                                      {ticket.ticketCode}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                      ATTENDEE
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                      {ticket.buyerName}
                                    </p>
                                  </div>

                                  <div className="sm:col-span-2">
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                      EMAIL
                                    </p>
                                    <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-white">
                                      {ticket.buyerEmail}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                      ORDER ID
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-900 dark:text-white">
                                      {activeOrderId}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                      ENTRY STATUS
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                      {formatStatusLabel(ticket.status)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-3xl border border-purple-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 text-white dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-black">
                                <p className="text-xs font-semibold tracking-[0.24em] text-white/60 uppercase">
                                  Entry QR
                                </p>
                                {qrCodeMap[ticket.ticketCode] ? (
                                  <div className="mt-4">
                                    <div className="flex justify-center rounded-[28px] bg-white p-4 shadow-lg shadow-black/20">
                                      <Image
                                        src={qrCodeMap[ticket.ticketCode]}
                                        alt={`QR code for ${ticket.ticketCode}`}
                                        width={256}
                                        height={256}
                                        unoptimized
                                        className="h-auto w-52 rounded-2xl bg-white sm:w-60"
                                      />
                                    </div>
                                    <p className="mt-4 text-center text-sm text-white/70">
                                      Scan this code at the gate for fast verification.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="mt-4 flex min-h-56 items-center justify-center rounded-[28px] bg-white/8 text-sm text-white/65">
                                    Preparing QR code...
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => void handleDownloadTicket(ticket)}
                                disabled={!qrCodeMap[ticket.ticketCode]}
                                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                              >
                                <LuDownload className="text-base" />
                                Download Ticket
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void navigator.clipboard.writeText(ticket.ticketCode);
                                }}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                              >
                                <LuCopy className="text-base" />
                                Copy Code
                              </button>
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

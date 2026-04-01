"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import jsQR from "jsqr";
import Webcam from "react-webcam";
import {
  LuCircleCheck,
  LuLoaderCircle,
  LuMail,
  LuPercent,
  LuQrCode,
  LuTicket,
  LuUser,
  LuX,
} from "react-icons/lu";

import Card from "@/components/Card";
import { formatNumber } from "@/helpers/format";
import { verifyDashboardTicket } from "@/helpers/organizer-api";
import { parseTicketInput } from "@/helpers/ticket";
import type { ApiTicket } from "@/helpers/type";

type Mode = "scan" | "manual";

type Props = {
  eventId: string;
  totalSold: number;
  initialVerifiedCount?: number;
  onVerifiedSuccess?: () => void;
};

function StatCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </p>
          <div className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        </div>

        <div className="text-purple-700 dark:text-purple-400">{icon}</div>
      </div>
    </div>
  );
}

function SuccessDetail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
        <span className="text-purple-600 dark:text-purple-300">{icon}</span>
        {label}
      </div>
      <p className="mt-2 break-words text-sm leading-6 font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function TicketVerificationClient({
  eventId,
  totalSold,
  initialVerifiedCount = 0,
  onVerifiedSuccess,
}: Props) {
  const [mode, setMode] = useState<Mode>("manual");
  const [ticketInput, setTicketInput] = useState("");
  const [verifiedCount, setVerifiedCount] = useState(initialVerifiedCount);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [verifiedTicket, setVerifiedTicket] = useState<ApiTicket | null>(null);
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isReadingRef = useRef(false);
  const lastScannedValueRef = useRef("");
  const lastScanTimeRef = useRef(0);

  const verificationRate = useMemo(() => {
    if (!Number.isFinite(totalSold) || totalSold <= 0) return 0;
    return Math.min(100, Math.round((verifiedCount / totalSold) * 100));
  }, [totalSold, verifiedCount]);

  const inputStyles =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const verifyMutation = useMutation({
    mutationFn: (ticketCode: string) =>
      verifyDashboardTicket(eventId, ticketCode),
    onSuccess: (ticket) => {
      if (ticket.eventId && ticket.eventId !== eventId) {
        setMessage({
          type: "error",
          text: "This ticket belongs to a different event.",
        });
        return;
      }

      setVerifiedCount((count) => {
        const nextCount = count + 1;
        return totalSold > 0 ? Math.min(totalSold, nextCount) : nextCount;
      });
      setVerifiedTicket(ticket);
      setMessage({
        type: "success",
        text: `${ticket.buyerName} checked in successfully.`,
      });
      setTicketInput("");
      onVerifiedSuccess?.();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't verify that ticket.",
      });
    },
  });

  const verifyInput = useCallback((rawInput: string) => {
    const parsed = parseTicketInput(rawInput);

    const code =
      parsed.kind === "payload"
        ? parsed.code
        : parsed.kind === "code"
          ? parsed.code
          : "";

    if (parsed.kind === "payload" && parsed.eventId !== eventId) {
      setMessage({
        type: "error",
        text: "This ticket belongs to a different event.",
      });
      return;
    }

    if (!code) {
      setMessage({ type: "error", text: "Enter a ticket code to verify." });
      return;
    }

    verifyMutation.mutate(code);
  }, [eventId, verifyMutation]);

  const handleVerifyClick = useCallback(() => {
    verifyInput(ticketInput);
  }, [ticketInput, verifyInput]);

  const activateScanMode = useCallback(() => {
    isReadingRef.current = false;
    setScannerError(null);
    setIsScannerReady(false);
    setMode("scan");
  }, []);

  const activateManualMode = useCallback(() => {
    isReadingRef.current = false;
    setScannerError(null);
    setIsScannerReady(false);
    setMode("manual");
  }, []);

  useEffect(() => {
    if (mode !== "scan" || !isScannerReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (isReadingRef.current || verifyMutation.isPending) {
        return;
      }

      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < 2) {
        return;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        return;
      }

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      const decoded = jsQR(imageData.data, width, height);

      if (!decoded?.data) {
        return;
      }

      const now = Date.now();
      if (
        decoded.data === lastScannedValueRef.current &&
        now - lastScanTimeRef.current < 1500
      ) {
        return;
      }

      lastScannedValueRef.current = decoded.data;
      lastScanTimeRef.current = now;
      isReadingRef.current = true;
      setTicketInput(decoded.data);
      verifyInput(decoded.data);
      window.setTimeout(() => {
        isReadingRef.current = false;
      }, 1200);
    }, 700);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isScannerReady, mode, verifyInput, verifyMutation.isPending]);

  return (
    <>
      {verifiedTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="h-2 w-full bg-linear-to-r from-emerald-400 via-purple-500 to-cyan-400" />
            <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5 dark:text-emerald-300 dark:ring-emerald-400/10">
                  <LuCircleCheck size={24} />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                  Ticket Verified
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  The attendee has been checked in successfully.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setVerifiedTicket(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close verification modal"
              >
                <LuX size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
              <SuccessDetail
                label="Attendee"
                value={verifiedTicket.buyerName}
                icon={<LuUser size={14} />}
              />
              <SuccessDetail
                label="Email"
                value={verifiedTicket.buyerEmail}
                icon={<LuMail size={14} />}
              />
              <SuccessDetail
                label="Ticket Code"
                value={verifiedTicket.ticketCode}
                icon={<LuTicket size={14} />}
              />
              <SuccessDetail
                label="Status"
                value={verifiedTicket.status}
                icon={<LuCircleCheck size={14} />}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
              Entry confirmed. You can move on to the next guest.
            </div>

            <button
              type="button"
              onClick={() => setVerifiedTicket(null)}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Done
            </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-10 space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <StatCard
          title="Verified"
          value={formatNumber(verifiedCount)}
          helper={`${verificationRate}% of sold tickets`}
          icon={<LuCircleCheck size={20} />}
        />
        <StatCard
          title="Total Sold"
          value={formatNumber(totalSold)}
          helper="Across all ticket types"
          icon={<LuTicket size={20} />}
        />
        <StatCard
          title="Verification Rate"
          value={`${verificationRate}%`}
          helper="Check-in progress"
          icon={<LuPercent size={20} />}
        />
      </section>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl dark:text-white">
              Scan or Enter Ticket
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
              QR Code or Barcode
            </p>
          </div>

          <div className="inline-flex w-full items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={activateScanMode}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-4 ${
                mode === "scan"
                  ? "bg-purple-600 text-white"
                  : "text-slate-700 hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              <LuQrCode className="text-base" />
              Scan
            </button>
            <button
              type="button"
              onClick={activateManualMode}
              className={`inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-4 ${
                mode === "manual"
                  ? "bg-purple-600 text-white"
                  : "text-slate-700 hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Manual
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === "scan" ? (
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
              <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950/70">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: { ideal: "environment" },
                  }}
                  onUserMedia={() => {
                    setScannerError(null);
                    setIsScannerReady(true);
                  }}
                  onUserMediaError={() => {
                    setIsScannerReady(false);
                    setScannerError(
                      "We couldn't open your camera. You can still paste the ticket code below.",
                    );
                  }}
                  className="aspect-video w-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {!isScannerReady ? (
                <div className="mt-4 inline-flex items-center justify-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 dark:border-purple-500/20 dark:bg-purple-500/10">
                  <LuLoaderCircle className="animate-spin" size={16} />
                </div>
              ) : null}

              <div className="mt-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/60 text-purple-600 dark:text-purple-300">
                  <LuQrCode size={28} />
                </div>
                <p className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
                  Point your device at the QR code
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  We will fill in the ticket details as soon as the code is read
                </p>
              </div>

              {scannerError ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                  {scannerError}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              QR Code or Barcode
            </label>
            <input
              value={ticketInput}
              onChange={(event) => setTicketInput(event.target.value)}
              placeholder="Paste or scan ticket code"
              className={inputStyles}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  verifyInput(ticketInput);
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleVerifyClick}
            disabled={verifyMutation.isPending}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-purple-400/30"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify Ticket"}
          </button>

          {message ? (
            <div
              className={`mt-4 rounded-xl border p-4 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
              }`}
              role="status"
            >
              {message.text}
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              TIPS
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Paste the raw QR payload or the backend ticket code</li>
              <li>Press Enter to verify quickly</li>
              <li>Checked-in tickets will be rejected by the backend</li>
            </ul>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}

export default TicketVerificationClient;

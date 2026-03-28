"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LuCircleCheck, LuPercent, LuQrCode, LuTicket } from "react-icons/lu";

import Card from "@/components/Card";
import { formatNumber } from "@/helpers/format";
import { verifyTicketCode } from "@/helpers/organizer-api";
import { parseTicketInput } from "@/helpers/ticket";

type Mode = "scan" | "manual";

type Props = {
  eventId: string;
  totalSold: number;
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

function TicketVerificationClient({ eventId, totalSold }: Props) {
  const [mode, setMode] = useState<Mode>("manual");
  const [ticketInput, setTicketInput] = useState("");
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  const verificationRate = useMemo(() => {
    if (!Number.isFinite(totalSold) || totalSold <= 0) return 0;
    return Math.min(100, Math.round((verifiedCount / totalSold) * 100));
  }, [totalSold, verifiedCount]);

  const inputStyles =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const verifyMutation = useMutation({
    mutationFn: verifyTicketCode,
    onSuccess: (ticket) => {
      if (ticket.eventId !== eventId) {
        setMessage({
          type: "error",
          text: "This ticket belongs to a different event.",
        });
        return;
      }

      setVerifiedCount((count) => count + 1);
      setMessage({
        type: "success",
        text: `Verified: ${ticket.ticketCode}`,
      });
      setTicketInput("");
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

  const handleVerify = () => {
    const parsed = parseTicketInput(ticketInput);

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
  };

  return (
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
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-6 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Scan or Enter Ticket
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              QR Code or Barcode
            </p>
          </div>

          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setMode("scan")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
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
              onClick={() => setMode("manual")}
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
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
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-10 text-center dark:border-white/10 dark:bg-white/5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/60 text-purple-600 dark:text-purple-300">
                <LuQrCode size={28} />
              </div>
              <p className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
                Point your device at the QR code
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                The ticket payload will automatically appear below
              </p>
            </div>
          ) : null}

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              QR Code or Barcode
            </label>
            <input
              value={ticketInput}
              onChange={(event) => setTicketInput(event.target.value)}
              placeholder="Scan QR code here..."
              className={inputStyles}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleVerify();
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
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
              <li>Paste the raw QR payload or ticket code</li>
              <li>Press Enter to verify quickly</li>
              <li>Checked-in tickets will be rejected by the backend</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TicketVerificationClient;

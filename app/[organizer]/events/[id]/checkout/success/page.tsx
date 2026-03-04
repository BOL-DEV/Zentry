import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { LuCheck, LuDownload, LuX } from "react-icons/lu";

import Card from "@/components/Card";
import { publicDemoEvents } from "@/data/demo";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

function createTicketCode(eventId: string) {
  let hash = 0;
  for (let index = 0; index < eventId.length; index += 1) {
    hash = (hash * 31 + eventId.charCodeAt(index)) >>> 0;
  }

  const suffix = hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return `EVT-${suffix}`;
}

async function Page({ params }: Props) {
  const { organizer, id } = await params;
  const event = publicDemoEvents.find((item) => item.id === id);

  if (!event) notFound();

  const attendeeName = "John Doe";
  const ticketType =
    event.ticketTypes.find((ticket) => ticket.price > 0) ?? event.ticketTypes[0];

  const code = createTicketCode(event.id);
  const payload = `eventflow://ticket?event=${encodeURIComponent(event.id)}&code=${encodeURIComponent(code)}`;

  const qrDataUrl = await QRCode.toDataURL(payload, {
    margin: 1,
    scale: 7,
  });

  const downloadText = [
    `Event: ${event.title}`,
    `Ticket type: ${ticketType?.name ?? "Ticket"}`,
    `Attendee: ${attendeeName}`,
    `Code: ${code}`,
    `Status: VALID`,
  ].join("\n");

  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(downloadText)}`;

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
                Payment Successful
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                1 Ticket Generated Successfully
              </p>
            </div>

            <div className="mt-8 max-h-105 overflow-y-auto pr-2">
              <div className="rounded-2xl border border-purple-200/70 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                      TICKET 1 OF 1
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {event.title}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Valid
                  </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                      TICKET TYPE
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {ticketType?.name ?? "Ticket"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                      ATTENDEE NAME
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {attendeeName}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-purple-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                    TICKET CODE
                  </p>
                  <p className="mt-2 font-mono text-lg font-bold tracking-widest text-slate-900 dark:text-white">
                    {code}
                  </p>
                </div>

                <div className="mt-6 flex justify-center">
                  <Image
                    src={qrDataUrl}
                    alt="Ticket QR code"
                    width={224}
                    height={224}
                    unoptimized
                    className="h-auto w-56 rounded-2xl bg-white p-3 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <a
                href={downloadHref}
                download={`${event.id}-ticket.txt`}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/20 dark:bg-white/95 dark:hover:bg-white"
              >
                <LuDownload className="text-base" />
                Download All Tickets
              </a>

              <Link
                href={`/${organizer}/events`}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-purple-200/70 bg-white/60 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-purple-400/20"
              >
                <LuX className="text-base" />
                Close
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default Page;

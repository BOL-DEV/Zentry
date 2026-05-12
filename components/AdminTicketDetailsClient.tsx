"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft, LuDownload, LuMail, LuMapPin, LuShieldCheck, LuTicket, LuUser } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { getAdminProfile, getAdminTicketDetail } from "@/helpers/organizer-api";
import { downloadTicketImage } from "@/helpers/ticket-image";

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

function StatusPill({ children, tone }: { children: React.ReactNode; tone: "emerald" | "slate" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      tone === "emerald"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
    }`}>
      {children}
    </span>
  );
}

type Props = { ticketId: string };

function AdminTicketDetailsClient({ ticketId }: Props) {
  const router = useRouter();
  const { token, user } = useAdminAuthSession();

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const ticketQuery = useQuery({
    queryKey: ["admin-ticket", ticketId],
    queryFn: () => getAdminTicketDetail(ticketId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/tickets/${ticketId}`)}&reason=auth-required`);
    }
  }, [router, ticketId, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;
    clearAdminAuthToken();
    router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/tickets/${ticketId}`)}&reason=session-expired`);
  }, [profileQuery.error, profileQuery.isFetching, router, ticketId]);

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || ticketQuery.isLoading) {
    return <FullPageLoader title="Loading ticket details" description="Pulling ticket verification, event, and organizer information." />;
  }

  if (profileQuery.error || ticketQuery.error || !profileQuery.data?.admin || !ticketQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : ticketQuery.error instanceof Error
          ? ticketQuery.error.message
          : "We couldn't load this ticket right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const { ticket } = ticketQuery.data;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="border-b border-purple-200/70 bg-white/80 pt-10 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/dashboard/admin/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">
            <LuArrowLeft className="text-base" />
            Back to tickets
          </Link>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">Ticket Detail</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">{ticket.ticketCode}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{ticket.buyerName} • {ticket.buyerEmail}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone={ticket.status === "checked-in" ? "emerald" : "slate"}>{ticket.status}</StatusPill>
              <button
                type="button"
                onClick={() =>
                  void downloadTicketImage({
                    eventId: ticket.eventId,
                    eventTitle: ticket.event.title,
                    attendeeName: ticket.buyerName,
                    attendeeEmail: ticket.buyerEmail,
                    ticketCode: ticket.ticketCode,
                    ticketStatus: ticket.status,
                    orderReference: ticket.orderId,
                  })
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Download Ticket Image
                <LuDownload className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <LuTicket className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Ticket record</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Ticket metadata</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Order ID</p><p className="mt-2 break-all text-sm font-semibold text-slate-950 dark:text-white">{ticket.orderId}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Ticket Type ID</p><p className="mt-2 break-all text-sm font-semibold text-slate-950 dark:text-white">{ticket.ticketTypeId}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Created</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{formatDateTime(ticket.createdAt)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Updated</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{formatDateTime(ticket.updatedAt)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] md:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Buyer</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{ticket.buyerName}</p><p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuMail className="text-base text-purple-600 dark:text-purple-300" />{ticket.buyerEmail}</p></div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Verification</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Checked in at</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{formatDateTime(ticket.checkedInAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Verified by</p>
                  {ticket.verifiedUser ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2"><LuUser className="text-base text-purple-600 dark:text-purple-300" />{ticket.verifiedUser.fullName}</p>
                      <p className="flex items-center gap-2"><LuMail className="text-base text-purple-600 dark:text-purple-300" />{ticket.verifiedUser.email}</p>
                      <p className="text-sm">{ticket.verifiedUser.role}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ticket.verifiedBy || "Not verified yet"}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Event + Organizer</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{ticket.event.title}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuMapPin className="text-base text-purple-600 dark:text-purple-300" />{ticket.event.location}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{formatDateTime(ticket.event.date)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{ticket.organizer.name}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">@{ticket.organizer.slug}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><LuShieldCheck className="text-base text-purple-600 dark:text-purple-300" />Status trail</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Current status: {ticket.status}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Checked in: {formatDateTime(ticket.checkedInAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminTicketDetailsClient;

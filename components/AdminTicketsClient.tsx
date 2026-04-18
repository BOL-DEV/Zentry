"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowUpRight, LuFilterX, LuScanLine, LuSearch, LuShieldCheck, LuTicket } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { getAdminProfile, getAdminTickets, verifyAdminTicket } from "@/helpers/organizer-api";

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

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "emerald" | "slate";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        tone === "emerald"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
      }`}
    >
      {children}
    </span>
  );
}

function AdminTicketsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user } = useAdminAuthSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(() => Number(searchParams.get("page") || "1") || 1);
  const [ticketCode, setTicketCode] = useState("");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all",
  );
  const [eventId, setEventId] = useState(() => searchParams.get("eventId") || "");
  const [organizerId, setOrganizerId] = useState(() => searchParams.get("organizerId") || "");
  const [verificationMessage, setVerificationMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  function updateListUrl(nextState: {
    page?: number;
    search?: string;
    status?: string;
    eventId?: string;
    organizerId?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const resolvedPage = nextState.page ?? page;
    const resolvedSearch = nextState.search ?? search;
    const resolvedStatus = nextState.status ?? statusFilter;
    const resolvedEventId = nextState.eventId ?? eventId;
    const resolvedOrganizerId = nextState.organizerId ?? organizerId;

    if (resolvedPage > 1) params.set("page", String(resolvedPage));
    else params.delete("page");

    if (resolvedSearch.trim()) params.set("search", resolvedSearch.trim());
    else params.delete("search");

    if (resolvedStatus !== "all") params.set("status", resolvedStatus);
    else params.delete("status");

    if (resolvedEventId.trim()) params.set("eventId", resolvedEventId.trim());
    else params.delete("eventId");

    if (resolvedOrganizerId.trim()) params.set("organizerId", resolvedOrganizerId.trim());
    else params.delete("organizerId");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const ticketsQuery = useQuery({
    queryKey: ["admin-tickets", page, search, statusFilter, eventId, organizerId],
    queryFn: () =>
      getAdminTickets({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "valid" | "checked-in"),
        eventId: eventId.trim() || undefined,
        organizerId: organizerId.trim() || undefined,
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  const verifyTicketMutation = useMutation({
    mutationFn: () => verifyAdminTicket(ticketCode.trim()),
    onSuccess: async (ticket) => {
      setVerificationMessage({
        type: "success",
        text: `Ticket ${ticket.ticketCode} verified successfully.`,
      });
      setTicketCode("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-ticket"] }),
      ]);
    },
    onError: (error) => {
      setVerificationMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't verify that ticket right now.",
      });
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin/tickets&reason=auth-required");
    }
  }, [router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;

    clearAdminAuthToken();
    router.replace("/admin/login?next=/dashboard/admin/tickets&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you to the secure admin sign-in page."
      />
    );
  }

  if (profileQuery.isLoading || profileQuery.isFetching || ticketsQuery.isLoading) {
    return (
      <FullPageLoader
        title="Loading tickets"
        description="Pulling ticket issuance, verification, and event ownership data."
      />
    );
  }

  if (profileQuery.error || ticketsQuery.error || !profileQuery.data?.admin) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : ticketsQuery.error instanceof Error
          ? ticketsQuery.error.message
          : "We couldn't load tickets right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader
          role="admin"
          email={profileQuery.data?.admin.email || user?.email || "Platform workspace"}
        />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const tickets = ticketsQuery.data?.tickets ?? [];
  const pagination = ticketsQuery.data?.pagination;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader
        role="admin"
        email={profileQuery.data.admin.email || user?.email || "Platform workspace"}
      />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
            Ticket Operations
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Ticket visibility across every organizer.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Monitor issued tickets, verification state, and which organizer or event each ticket belongs to, all from the central admin workspace.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Admin Verification
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  Verify a ticket code directly
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Use the new admin verification endpoint to check in a guest without switching into an organizer workspace.
                </p>
              </div>

              <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  value={ticketCode}
                  onChange={(event) => setTicketCode(event.target.value)}
                  placeholder="Enter ticket code"
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!ticketCode.trim()) {
                      setVerificationMessage({
                        type: "error",
                        text: "Enter a ticket code to verify.",
                      });
                      return;
                    }
                    verifyTicketMutation.mutate();
                  }}
                  disabled={verifyTicketMutation.isPending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-70"
                >
                  <LuScanLine className="text-base" />
                  {verifyTicketMutation.isPending ? "Verifying..." : "Verify Ticket"}
                </button>
              </div>
            </div>

            {verificationMessage ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  verificationMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                }`}
              >
                {verificationMessage.text}
              </div>
            ) : null}
          </Card>

          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_220px_220px_auto]">
              <label className="relative block">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setSearch(nextValue);
                    setPage(1);
                    updateListUrl({ search: nextValue, page: 1 });
                  }}
                  placeholder="Search code, buyer, or email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setStatusFilter(nextValue);
                  setPage(1);
                  updateListUrl({ status: nextValue, page: 1 });
                }}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="all">All statuses</option>
                <option value="valid">Valid</option>
                <option value="checked-in">Checked in</option>
              </select>
              <input
                value={eventId}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setEventId(nextValue);
                  setPage(1);
                  updateListUrl({ eventId: nextValue, page: 1 });
                }}
                placeholder="Event ID"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <input
                value={organizerId}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setOrganizerId(nextValue);
                  setPage(1);
                  updateListUrl({ organizerId: nextValue, page: 1 });
                }}
                placeholder="Organizer ID"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setEventId("");
                  setOrganizerId("");
                  setPage(1);
                  updateListUrl({
                    search: "",
                    status: "all",
                    eventId: "",
                    organizerId: "",
                    page: 1,
                  });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuFilterX className="text-base" />
                Reset
              </button>
            </div>
          </Card>

          <div className="space-y-5">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        <LuTicket className="text-xl" />
                      </div>
                      <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
                        {ticket.ticketCode}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {ticket.buyerName} • {ticket.buyerEmail}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {ticket.event.title} • @{ticket.organizer.slug}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusPill tone={ticket.status === "checked-in" ? "emerald" : "slate"}>
                        {ticket.status}
                      </StatusPill>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Created
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Checked In
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {formatDateTime(ticket.checkedInAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Verified By
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {ticket.verifiedBy || "Not verified yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Event Date
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {formatDateTime(ticket.event.date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <LuShieldCheck className="text-base text-purple-600 dark:text-purple-300" />
                      {ticket.event.location || "No location"}
                    </div>
                    <Link
                      href={`/dashboard/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                    >
                      Open Ticket
                      <LuArrowUpRight className="text-base" />
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-sm text-slate-600 dark:text-slate-300">
                No tickets available right now.
              </Card>
            )}
          </div>

          {pagination?.totalPages && pagination.totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setPage((current) => {
                    const nextPage = Math.max(1, current - 1);
                    updateListUrl({ page: nextPage });
                    return nextPage;
                  })
                }
                disabled={page <= 1}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Previous
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Page {page} of {pagination.totalPages}
              </p>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => {
                    const nextPage = Math.min(pagination.totalPages || current, current + 1);
                    updateListUrl({ page: nextPage });
                    return nextPage;
                  })
                }
                disabled={page >= (pagination.totalPages || page)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default AdminTicketsClient;

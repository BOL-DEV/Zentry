"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowUpRight, LuFilterX, LuInbox, LuSearch } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import {
  getAdminOrganizerRequests,
  getAdminProfile,
} from "@/helpers/organizer-api";

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
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const styles =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : status === "rejected"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

function AdminOrganizerRequestsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user } = useAdminAuthSession();
  const [page, setPage] = useState(() => Number(searchParams.get("page") || "1") || 1);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all",
  );

  function updateListUrl(nextState: {
    page?: number;
    search?: string;
    status?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const resolvedPage = nextState.page ?? page;
    const resolvedSearch = nextState.search ?? search;
    const resolvedStatus = nextState.status ?? statusFilter;

    if (resolvedPage > 1) params.set("page", String(resolvedPage));
    else params.delete("page");

    if (resolvedSearch.trim()) params.set("search", resolvedSearch.trim());
    else params.delete("search");

    if (resolvedStatus !== "all") params.set("status", resolvedStatus);
    else params.delete("status");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const requestsQuery = useQuery({
    queryKey: ["admin-organizer-requests", page, search, statusFilter],
    queryFn: () =>
      getAdminOrganizerRequests({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "pending" | "approved" | "rejected"),
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin/organizer-requests&reason=auth-required");
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
    router.replace("/admin/login?next=/dashboard/admin/organizer-requests&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you to the secure admin sign-in page."
      />
    );
  }

  if (profileQuery.isLoading || profileQuery.isFetching || requestsQuery.isLoading) {
    return (
      <FullPageLoader
        title="Loading organizer requests"
        description="Pulling pending, approved, and rejected onboarding requests."
      />
    );
  }

  if (profileQuery.error || requestsQuery.error || !profileQuery.data?.admin) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : requestsQuery.error instanceof Error
          ? requestsQuery.error.message
          : "We couldn't load organizer requests right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const requests = requestsQuery.data?.requests ?? [];
  const pagination = requestsQuery.data?.pagination;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="border-b border-purple-200/70 bg-white/80 pt-10 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
            Organizer Requests
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Review organizer onboarding requests.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            New organizers now come in as requests first. Review, approve, or reject them before a real organizer profile and dashboard account get created.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Card className="border-slate-200/80 bg-white/90 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.96),rgba(4,11,23,0.98))]">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
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
                  placeholder="Search name or email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-cyan-400/10 dark:bg-[#0b1628] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-400/15"
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
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:[color-scheme:dark] dark:border-cyan-400/10 dark:bg-[#0b1628] dark:text-white dark:focus:border-cyan-300 dark:focus:ring-cyan-400/15"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPage(1);
                  updateListUrl({ search: "", status: "all", page: 1 });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-cyan-400/10 dark:bg-[#0b1628] dark:text-white dark:hover:bg-[#10203a]"
              >
                <LuFilterX className="text-base" />
                Reset
              </button>
            </div>
          </Card>

          <div className="mt-6 space-y-5">
            {requests.length ? (
              requests.map((request) => (
                <Card
                  key={request.id}
                  className="border-slate-200/80 bg-white/90 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.96),rgba(4,11,23,0.98))]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-cyan-400/12 dark:text-cyan-300">
                        <LuInbox className="text-xl" />
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
                        {request.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {request.email}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {request.location || "No location provided"}
                      </p>
                    </div>

                    <StatusPill status={request.status} />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Preferred Slug
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {request.preferredSlug || "No preferred slug"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Submitted
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Created Organizer
                      </p>
                      <p className="mt-2 break-all text-sm font-semibold text-slate-950 dark:text-white">
                        {request.createdOrganizerId || "Not created"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Review Note
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {request.reviewNote || "No review note"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Link
                      href={`/dashboard/admin/organizer-requests/${request.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:border dark:border-cyan-400/20 dark:bg-cyan-400/12 dark:text-cyan-100 dark:hover:bg-cyan-400/18"
                    >
                      Open Request
                      <LuArrowUpRight className="text-base" />
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-sm text-slate-600 dark:text-slate-300">
                No organizer requests match this view right now.
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
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60 dark:border-cyan-400/10 dark:bg-[#0b1628] dark:text-white dark:hover:bg-[#10203a]"
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
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60 dark:border-cyan-400/10 dark:bg-[#0b1628] dark:text-white dark:hover:bg-[#10203a]"
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

export default AdminOrganizerRequestsClient;

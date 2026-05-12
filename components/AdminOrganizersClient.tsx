"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowUpRight, LuBuilding2, LuFilterX, LuMail, LuPhone, LuSearch } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import { getAdminOrganizers, getAdminProfile } from "@/helpers/organizer-api";

function StatusPill({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function AdminOrganizersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user } = useAdminAuthSession();
  const [page, setPage] = useState(() => Number(searchParams.get("page") || "1") || 1);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [activeFilter, setActiveFilter] = useState(
    () => searchParams.get("isActive") || "all",
  );

  function updateListUrl(nextState: {
    page?: number;
    search?: string;
    isActive?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const resolvedPage = nextState.page ?? page;
    const resolvedSearch = nextState.search ?? search;
    const resolvedIsActive = nextState.isActive ?? activeFilter;

    if (resolvedPage > 1) params.set("page", String(resolvedPage));
    else params.delete("page");

    if (resolvedSearch.trim()) params.set("search", resolvedSearch.trim());
    else params.delete("search");

    if (resolvedIsActive !== "all") params.set("isActive", resolvedIsActive);
    else params.delete("isActive");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const organizersQuery = useQuery({
    queryKey: ["admin-organizers", page, search, activeFilter],
    queryFn: () =>
      getAdminOrganizers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        isActive:
          activeFilter === "all"
            ? undefined
            : activeFilter === "active",
      }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin/organizers&reason=auth-required");
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
    router.replace("/admin/login?next=/dashboard/admin/organizers&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you to the secure admin sign-in page."
      />
    );
  }

  if (profileQuery.isLoading || profileQuery.isFetching || organizersQuery.isLoading) {
    return (
      <FullPageLoader
        title="Loading organizers"
        description="Pulling organizer records and platform activity stats."
      />
    );
  }

  if (profileQuery.error || organizersQuery.error || !profileQuery.data?.admin) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : organizersQuery.error instanceof Error
          ? organizersQuery.error.message
          : "We couldn't load organizers right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const organizers = organizersQuery.data?.organizers ?? [];
  const pagination = organizersQuery.data?.pagination;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="border-b border-purple-200/70 bg-white/80 pt-10 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
            Organizer Directory
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Platform organizers at a glance.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Review organizer activity, revenue performance, and account status, then jump into each organizer’s control page when you need the deeper view.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
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
                  placeholder="Search organizer name, slug, or email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </label>
              <select
                value={activeFilter}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setActiveFilter(nextValue);
                  setPage(1);
                  updateListUrl({ isActive: nextValue, page: 1 });
                }}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <option value="all">All organizers</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("all");
                  setPage(1);
                  updateListUrl({ search: "", isActive: "all", page: 1 });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuFilterX className="text-base" />
                Reset
              </button>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            {organizers.length > 0 ? (
              organizers.map((organizer) => (
                <Card
                  key={organizer.id}
                  className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                        <LuBuilding2 className="text-xl" />
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
                        {organizer.name}
                      </h2>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        @{organizer.slug}
                      </p>
                    </div>

                    <StatusPill active={organizer.isActive} />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Events
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                        {organizer.stats.totalEvents}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Paid Orders
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                        {organizer.stats.totalPaidOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Tickets Sold
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                        {organizer.stats.totalTicketsSold}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Gross Revenue
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                        {formatCurrency(organizer.stats.grossRevenue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <LuMail className="text-base text-purple-600 dark:text-purple-300" />
                      {organizer.contactEmail || "No contact email"}
                    </p>
                    <p className="flex items-center gap-2">
                      <LuPhone className="text-base text-purple-600 dark:text-purple-300" />
                      {organizer.contactPhone || "No contact phone"}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Link
                      href={`/dashboard/admin/organizers/${organizer.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                    >
                      Open Organizer
                      <LuArrowUpRight className="text-base" />
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="xl:col-span-2 text-sm text-slate-600 dark:text-slate-300">
                No organizers available right now.
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

export default AdminOrganizersClient;

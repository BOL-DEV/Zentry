"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuArrowUpRight,
  LuCircleCheck,
  LuLogOut,
  LuQrCode,
  LuRefreshCw,
  LuSearch,
  LuShieldCheck,
  LuTicket,
} from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import PlatformLogo from "@/components/PlatformLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { formatNumber } from "@/helpers/format";
import {
  getOrganizerStaffWorkspaceData,
  logoutDashboardUser,
} from "@/helpers/organizer-api";

function OrganizerStaffDashboardClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user: authUser } = useAuthSession();
  const [eventSearch, setEventSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If the logged-in user is an Organizer, send them to the organizer dashboard immediately!
  useEffect(() => {
    if (authUser?.role === "organizer") {
      router.replace(`/${organizer}/dashboard`);
    }
  }, [authUser?.role, organizer, router]);

  // If unauthenticated, redirect to login cleanly without leaving ?next=...staff in the URL
  useEffect(() => {
    if (!token) {
      router.replace(`/login?reason=auth-required`);
    }
  }, [router, token]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["organizer-staff-dashboard", organizer],
    queryFn: () => getOrganizerStaffWorkspaceData(organizer),
    enabled: Boolean(token) && authUser?.role !== "organizer",
  });

  useEffect(() => {
    if (!isAuthIssue(error)) return;

    clearAuthToken();
    router.replace(`/login?reason=session-expired`);
  }, [error, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutDashboardUser();
    } catch {
      // Clear local session even if backend call fails or session is already revoked
    } finally {
      queryClient.clear();
      clearAuthToken();
      router.replace(`/${organizer}`);
      setIsLoggingOut(false);
    }
  }

  const allEvents = useMemo(() => data?.events ?? [], [data?.events]);

  const filteredEvents = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    if (!query) return allEvents;
    return allEvents.filter(
      (ev) =>
        ev.title.toLowerCase().includes(query) ||
        ev.dateTimeText.toLowerCase().includes(query),
    );
  }, [allEvents, eventSearch]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to login"
        description="Taking you back to sign in."
      />
    );
  }

  if (authUser?.role === "organizer") {
    return (
      <FullPageLoader
        title="Opening Organizer Dashboard"
        description="Redirecting you to your organizer management workspace."
      />
    );
  }

  if (isLoading) {
    return (
      <FullPageLoader
        title="Loading check-in area"
        description="We are getting your event list and check-in tools ready."
      />
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-purple-100 dark:bg-slate-950/90 flex flex-col">
        {/* Simple Navbar even in error state */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href={`/${organizer}/staff`} className="flex items-center gap-2.5">
              <PlatformLogo className="h-8 w-24" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                Staff Portal
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
              >
                <LuLogOut className="text-sm" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 pt-12 pb-16">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't open the check-in area right now."}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white transition hover:bg-purple-700"
              >
                Try Again
              </button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-100 text-slate-900 antialiased dark:bg-slate-950/90 dark:text-white flex flex-col">
      {/* Professional Sticky Staff Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Left Brand & Portal badge */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${organizer}/staff`}
              className="flex items-center gap-2.5 transition hover:opacity-85"
            >
              <PlatformLogo className="h-8 w-24" />
              <span className="hidden sm:inline-block h-4 w-px bg-slate-200 dark:bg-white/15" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Staff Portal
              </span>
            </Link>
          </div>

          {/* Right Controls: Staff user card, Theme toggle, Logout */}
          <div className="flex items-center gap-3">
            {/* User details */}
            <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-medium dark:border-white/10 dark:bg-white/5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white uppercase shadow-sm">
                {authUser?.fullName ? authUser.fullName.charAt(0) : "S"}
              </span>
              <div className="text-left">
                <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                  {authUser?.fullName || "Staff Member"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {authUser?.email || ""}
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <ThemeToggle />
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
            >
              <LuLogOut className="text-sm" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
          {/* Top Page Header Card */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live Gate Scanner Ready
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    • Event Operations
                  </span>
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Guest Entry & Ticket Scanning
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Signed in as <span className="font-semibold text-slate-900 dark:text-white">{authUser?.fullName || "team member"}</span>. Select any event below to open the live camera QR scanner or enter ticket codes manually.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuRefreshCw className={`text-sm ${isFetching ? "animate-spin" : ""}`} />
                <span>{isFetching ? "Refreshing..." : "Refresh Events"}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                <LuShieldCheck size={20} />
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Access Level
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Check-in Staff
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                <LuTicket size={20} />
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Active Events
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(data.totals.events)}
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                <LuCircleCheck size={20} />
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Total Tickets Sold
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(data.totals.ticketsSold)}
              </p>
            </Card>
          </section>

          {/* Event Search / Filter */}
          {allEvents.length > 1 && (
            <div className="mt-6">
              <div className="relative">
                <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Filter events by title or date..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Event List Section */}
          <section className="mt-6 space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                          Scheduled
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {event.dateTimeText}
                        </span>
                      </div>

                      <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </h2>

                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatNumber(event.capacitySold)}
                        </span>{" "}
                        tickets sold across {formatNumber(event.ticketTypesCount)} ticket tier
                        {event.ticketTypesCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href={`/${organizer}/dashboard/${event.id}/verify`}
                        className="inline-flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 active:scale-[0.98]"
                      >
                        <LuQrCode className="text-base" />
                        <span>Open Check-in</span>
                        <LuArrowUpRight className="text-base opacity-75" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : allEvents.length > 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No events matched "{eventSearch}".
                </p>
                <button
                  type="button"
                  onClick={() => setEventSearch("")}
                  className="mt-3 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No events found for this organizer yet. Once the organizer publishes events, they will appear here for gate check-in.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default OrganizerStaffDashboardClient;

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  LuArrowUpRight,
  LuCircleCheck,
  LuShieldCheck,
  LuTicket,
} from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { getAuthToken, getAuthUser } from "@/helpers/auth";
import { formatNumber } from "@/helpers/format";
import { getOrganizerStaffWorkspaceData } from "@/helpers/organizer-api";

function OrganizerStaffDashboardClient({ organizer }: { organizer: string }) {
  const token = getAuthToken();
  const authUser = getAuthUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-staff-dashboard", organizer],
    queryFn: () => getOrganizerStaffWorkspaceData(organizer),
    enabled: Boolean(token),
  });

  if (!token) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sign in to access the staff workspace.
            </p>
            <Link
              href={`/login?next=/${organizer}/staff`}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Go to Login
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <FullPageLoader
        title="Loading staff workspace"
        description="We are preparing your assigned events and verification tools."
      />
    );
  }

  if (error || !data) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't load the staff workspace."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">
            Staff Workspace
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Check-in and verification
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Signed in as {authUser?.fullName || "staff"}.
            Open any event below to verify attendee tickets.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <LuShieldCheck size={20} />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Role
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {authUser?.role === "staff" ? "Staff" : "Organizer"}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <LuTicket size={20} />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Events
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(data.totals.events)}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <LuCircleCheck size={20} />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Tickets Sold
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(data.totals.ticketsSold)}
            </p>
          </Card>
        </section>

        <section className="mt-8 space-y-5">
          {data.events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {event.dateTimeText}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {formatNumber(event.capacitySold)} tickets sold across{" "}
                    {formatNumber(event.ticketTypesCount)} ticket types
                  </p>
                </div>

                <Link
                  href={`/${organizer}/dashboard/${event.id}/verify`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Open Verification
                  <LuArrowUpRight className="text-base" />
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default OrganizerStaffDashboardClient;

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
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
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
              Sign in to open the guest check-in area.
            </p>
            <Link
              href={`/login?next=/${organizer}/staff`}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Sign In
            </Link>
          </Card>
        </div>
      </main>
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
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't open the check-in area right now."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Check-in Area"
          title="Guest entry and ticket scanning"
          description={`Signed in as ${authUser?.fullName || "team member"}. Open any event below to check guests in.`}
        />

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
                  Open Check-in
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

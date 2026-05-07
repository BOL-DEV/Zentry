"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LuArrowRight, LuUsers } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import OrganizerAttendeesList from "@/components/OrganizerAttendeesList";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { formatCurrency, formatNumber } from "@/helpers/format";
import {
  getOrganizerDashboardData,
  getOrganizerEventAttendees,
} from "@/helpers/organizer-api";

function OrganizerAttendeesPageClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user: authUser } = useAuthSession();
  const selectedEventId = searchParams.get("eventId") || "";

  const eventsQuery = useQuery({
    queryKey: ["organizer-attendees-events", organizer],
    queryFn: () => getOrganizerDashboardData(organizer),
    enabled: Boolean(token) && authUser?.role !== "staff",
  });

  const selectedEvent = useMemo(
    () =>
      eventsQuery.data?.events.find((event) => event.id === selectedEventId) ?? null,
    [eventsQuery.data?.events, selectedEventId],
  );

  const attendeesQuery = useQuery({
    queryKey: ["organizer-attendees-list", selectedEventId],
    queryFn: () => getOrganizerEventAttendees(selectedEventId),
    enabled: Boolean(token) && authUser?.role !== "staff" && Boolean(selectedEventId),
  });

  useEffect(() => {
    if (!token) {
      router.replace(
        `/login?next=/${organizer}/dashboard/attendees&reason=auth-required`,
      );
    }
  }, [organizer, router, token]);

  useEffect(() => {
    if (!isAuthIssue(eventsQuery.error) && !isAuthIssue(attendeesQuery.error)) return;

    clearAuthToken();
    router.replace(
      `/login?next=/${organizer}/dashboard/attendees&reason=session-expired`,
    );
  }, [attendeesQuery.error, eventsQuery.error, organizer, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to login"
        description="Taking you back to sign in."
      />
    );
  }

  if (authUser?.role === "staff") {
    return (
      <main className="bg-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Staff accounts can use the check-in workspace, but only organizer accounts can review the full attendee list.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  if (eventsQuery.isLoading) {
    return (
      <FullPageLoader
        title="Loading attendee workspace"
        description="Preparing your event list and attendee data."
      />
    );
  }

  if (eventsQuery.error || !eventsQuery.data) {
    return (
      <main className="bg-transparent">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {eventsQuery.error instanceof Error
                ? eventsQuery.error.message
                : "We couldn't load your attendee workspace right now."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const events = eventsQuery.data.events;

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <WorkspaceTopbar
          eyebrow="Attendee Control"
          title="Browse attendees by event."
          description="Start with an event card, then open the full attendee list for that event."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
          showLogoutButton={false}
          showActions={false}
        />

        <section className="mt-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.length ? (
              events.map((event) => {
                const active = event.id === selectedEventId;

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("eventId", event.id);
                      router.replace(`${pathname}?${params.toString()}`);
                    }}
                    className={`overflow-hidden rounded-3xl border p-5 text-left shadow-sm transition ${
                      active
                        ? "border-purple-300 bg-purple-50 dark:border-purple-500/30 dark:bg-purple-500/10"
                        : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-500/30 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {event.dateTimeText}
                        </p>
                      </div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        <LuUsers className="text-lg" />
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Sold
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                          {formatNumber(event.capacitySold)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Revenue
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(event.revenue)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>
                        {formatNumber(event.checkIns)} checked in
                      </span>
                      <span className="inline-flex items-center gap-2 font-semibold text-purple-700 dark:text-purple-200">
                        {active ? "Viewing attendees" : "Open attendees"}
                        <LuArrowRight className="text-base" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:col-span-2 xl:col-span-3">
                No events are available yet. Create an event first to start collecting attendees.
              </div>
            )}
          </div>
        </section>

        {selectedEvent ? (
          <section className="mt-8">
            {attendeesQuery.isLoading ? (
              <Card>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Loading attendees for {selectedEvent.title}...
                </p>
              </Card>
            ) : attendeesQuery.error ? (
              <Card>
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                  {attendeesQuery.error instanceof Error
                    ? attendeesQuery.error.message
                    : "We couldn't load attendees for this event right now."}
                </p>
              </Card>
            ) : (
              <OrganizerAttendeesList
                attendees={attendeesQuery.data?.attendees ?? []}
                title={`${selectedEvent.title} Attendees`}
                description="Filter by guest name, email, ticket code, or ticket type."
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                maxHeightClass="max-h-[34rem]"
              />
            )}

            <div className="mt-4 flex justify-end">
              <Link
                href={`/${organizer}/dashboard/${selectedEvent.id}/verify`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Open Check-in Desk
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default OrganizerAttendeesPageClient;

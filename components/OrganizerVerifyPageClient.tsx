"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import OrganizerAttendeesList from "@/components/OrganizerAttendeesList";
import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import TicketVerificationClient from "@/components/TicketVerificationClient";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { getAuthToken, getAuthUser } from "@/helpers/auth";
import {
  getOrganizerEventAttendees,
  getOrganizerEventDetails,
  getOrganizerScannerSummary,
} from "@/helpers/organizer-api";

function OrganizerVerifyPageClient({
  organizer,
  eventId,
}: {
  organizer: string;
  eventId: string;
}) {
  const token = getAuthToken();
  const authUser = getAuthUser();
  const [refreshVersion, setRefreshVersion] = useState(0);
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-verify-event", organizer, eventId, refreshVersion],
    queryFn: async () => {
      const [eventDetails, scannerSummary, attendees] = await Promise.all([
        getOrganizerEventDetails(organizer, eventId),
        getOrganizerScannerSummary(eventId),
        authUser?.role === "staff"
          ? Promise.resolve(null)
          : getOrganizerEventAttendees(eventId),
      ]);

      return { eventDetails, scannerSummary, attendees };
    },
    enabled: Boolean(token),
  });

  const backHref =
    authUser?.role === "staff" ? `/${organizer}/staff` : `/${organizer}/dashboard`;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        {!token ? (
          <div className="mt-6">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Sign in to check guests in for this event.
              </p>
              <Link
                href={`/login?next=/${organizer}/dashboard/${eventId}/verify`}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Sign In
              </Link>
            </Card>
          </div>
        ) : isLoading ? (
          <FullPageLoader
            title="Loading check-in tools"
            description="We are getting guest details and entry updates ready."
          />
        ) : error || !data ? (
          <div className="mt-6">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't open this event for check-in right now."}
              </p>
            </Card>
          </div>
        ) : (
          <>
            <WorkspaceTopbar
              eyebrow="Check-in Desk"
              title={data.eventDetails.event.title}
              description="Check guests in and keep an eye on entry updates in real time."
              backHref={backHref}
              backLabel="Back"
            />

            <TicketVerificationClient
              eventId={data.eventDetails.event.id}
              totalSold={data.scannerSummary.scannerSummary.totalTicketsSold}
              initialVerifiedCount={data.scannerSummary.scannerSummary.totalCheckedIn}
              onVerifiedSuccess={() => setRefreshVersion((value) => value + 1)}
            />

            {authUser?.role !== "staff" ? (
              <section className="mt-10">
                <OrganizerAttendeesList
                  attendees={data.attendees?.attendees ?? []}
                  title="Checked-in Guests"
                  description="People who have already been checked in."
                  statusFilter="checked-in"
                  maxHeightClass="max-h-[24rem]"
                />
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

export default OrganizerVerifyPageClient;

"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft } from "react-icons/lu";

import OrganizerAttendeesList from "@/components/OrganizerAttendeesList";
import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import TicketVerificationClient from "@/components/TicketVerificationClient";
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
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <LuArrowLeft className="text-base" />
          Back to Dashboard
        </Link>

        {!token ? (
          <div className="mt-6">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Sign in to verify tickets for this event.
              </p>
              <Link
                href={`/login?next=/${organizer}/dashboard/${eventId}/verify`}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Go to Login
              </Link>
            </Card>
          </div>
        ) : isLoading ? (
          <FullPageLoader
            title="Loading verification tools"
            description="We are getting the event scanner summary and attendee data ready."
          />
        ) : error || !data ? (
          <div className="mt-6">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't load this event for verification."}
              </p>
            </Card>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {data.eventDetails.event.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Verify attendee tickets for check-in
              </p>
            </div>

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
                  title="Checked-in Attendees"
                  description="People who have already been verified for entry."
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

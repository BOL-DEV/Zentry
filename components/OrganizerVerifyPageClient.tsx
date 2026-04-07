"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";

import OrganizerAttendeesList from "@/components/OrganizerAttendeesList";
import Card from "@/components/Card";
import TicketVerificationClient from "@/components/TicketVerificationClient";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
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
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { token, user: authUser } = useAuthSession();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["organizer-verify-event", organizer, eventId],
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

  useEffect(() => {
    if (!isHydrated || token) return;

    router.replace(
      `/login?next=/${organizer}/dashboard/${eventId}/verify&reason=auth-required`,
    );
  }, [eventId, isHydrated, organizer, router, token]);

  useEffect(() => {
    if (!isAuthIssue(error)) return;

    clearAuthToken();
    router.replace(
      `/login?next=/${organizer}/dashboard/${eventId}/verify&reason=session-expired`,
    );
  }, [error, eventId, organizer, router]);

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        {!isHydrated ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <ClipLoader color="#7e22ce" size={42} speedMultiplier={0.9} />
          </div>
        ) : !token ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <ClipLoader color="#7e22ce" size={42} speedMultiplier={0.9} />
          </div>
        ) : isLoading && !data ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <ClipLoader color="#7e22ce" size={42} speedMultiplier={0.9} />
          </div>
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

            {isFetching ? (
              <div className="mt-4 inline-flex items-center justify-center rounded-full border border-purple-200/70 bg-white/80 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
                <ClipLoader color="#7e22ce" size={16} speedMultiplier={0.9} />
              </div>
            ) : null}

            <TicketVerificationClient
              eventId={data.eventDetails.event.id}
              totalSold={data.scannerSummary.scannerSummary.totalTicketsSold}
              initialVerifiedCount={data.scannerSummary.scannerSummary.totalCheckedIn}
              onVerifiedSuccess={() => {
                void refetch();
              }}
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

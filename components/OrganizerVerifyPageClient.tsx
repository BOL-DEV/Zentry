"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LuArrowLeft } from "react-icons/lu";

import Card from "@/components/Card";
import TicketVerificationClient from "@/components/TicketVerificationClient";
import { getOrganizerEventDetails } from "@/helpers/organizer-api";

function OrganizerVerifyPageClient({
  organizer,
  eventId,
}: {
  organizer: string;
  eventId: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-verify-event", organizer, eventId],
    queryFn: () => getOrganizerEventDetails(organizer, eventId),
  });

  const backHref = `/${organizer}/dashboard`;

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

        {isLoading ? (
          <div className="mt-6">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Loading verification tools...
              </p>
            </Card>
          </div>
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
                {data.event.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Verify attendee tickets for check-in
              </p>
            </div>

            <TicketVerificationClient
              eventId={data.event.id}
              totalSold={data.totalSold}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default OrganizerVerifyPageClient;

"use client";

import { useQuery } from "@tanstack/react-query";

import AdminEventDetails from "@/components/AdminEventDetails";
import Card from "@/components/Card";
import { getOrganizerEventDetails } from "@/helpers/organizer-api";

function OrganizerEventDetailsClient({
  organizer,
  eventId,
}: {
  organizer: string;
  eventId: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-event-details", organizer, eventId],
    queryFn: () => getOrganizerEventDetails(organizer, eventId),
  });

  if (isLoading) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Loading event details...
            </p>
          </Card>
        </div>
      </main>
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
                : "We couldn't load this event."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <AdminEventDetails
      event={data.event}
      backHref={`/${organizer}/events`}
      organizerSlug={organizer}
      organizer={{
        name: data.organizer.name,
        tagline: data.organizer.heroTitle || "Creating unforgettable experiences",
        profileHref: `/${organizer}`,
      }}
    />
  );
}

export default OrganizerEventDetailsClient;

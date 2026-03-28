"use client";

import { useQuery } from "@tanstack/react-query";

import Card from "@/components/Card";
import EventCard from "@/components/EventCard";
import EventPageTitle from "@/components/EventPageTitle";
import { getOrganizerEventsPageData } from "@/helpers/organizer-api";

function OrganizerEventsPageClient({ organizer }: { organizer: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-events", organizer],
    queryFn: () => getOrganizerEventsPageData(organizer),
  });

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <EventPageTitle />

        {isLoading ? (
          <div className="mt-10">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Loading events...
              </p>
            </Card>
          </div>
        ) : error || !data ? (
          <div className="mt-10">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't load organizer events."}
              </p>
            </Card>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-10">
            {data.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default OrganizerEventsPageClient;

"use client";

import { useQuery } from "@tanstack/react-query";

import Card from "@/components/Card";
import EventCard from "@/components/EventCard";
import EventPageTitle from "@/components/EventPageTitle";
import FullPageLoader from "@/components/FullPageLoader";
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
          <FullPageLoader
            title="Loading events"
            description="We are gathering every event published by this organizer."
          />
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
        ) : data.length > 0 ? (
          <div className="mt-10 flex flex-col gap-10">
            {data.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <Card className="border-dashed border-purple-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col gap-2 py-2">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  No upcoming events yet
                </p>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  There are no upcoming events available right now. New event
                  dates will appear here once this organizer publishes them.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

export default OrganizerEventsPageClient;

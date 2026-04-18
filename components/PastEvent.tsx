"use client";

import { useEffect, useState } from "react";

import { getPublicLandingPastEvents } from "@/helpers/organizer-api";
import type { PublicLandingPastEvent } from "@/helpers/type";

import PastEventCard from "./PastEventCard";

export type PastEventItem = PublicLandingPastEvent;

function PastEvent() {
  const [events, setEvents] = useState<PastEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPastEvents() {
      try {
        const items = await getPublicLandingPastEvents(4);
        if (isMounted) {
          setEvents(items);
        }
      } catch {
        if (isMounted) {
          setEvents([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPastEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="flex flex-col gap-8 bg-purple-100 p-5 py-20 dark:bg-slate-950/90">
      <div className="flex flex-col gap-2 lg:pl-80">
        <h1 className="text-4xl font-bold dark:text-white">
          Past Events Gallery
        </h1>
        <h3 className="text-lg text-slate-600 dark:text-slate-400">
          Explore some of the latest completed experiences across the platform.
        </h3>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:flex-wrap">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`past-event-skeleton-${index}`}
                className="h-88 w-full animate-pulse rounded-xl border border-slate-200 bg-white/70 shadow-md dark:border-slate-700 dark:bg-slate-800/70 lg:w-72"
              />
            ))
          : events.length > 0
            ? events.map((event) => <PastEventCard key={event.id} event={event} />)
            : (
                <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/85 px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                  <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                    No past events yet
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Completed events will appear here once organizers start wrapping up
                    experiences across the platform.
                  </p>
                </div>
              )}
      </div>
    </section>
  );
}

export default PastEvent;

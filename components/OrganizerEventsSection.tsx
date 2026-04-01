"use client";

import Link from "next/link";
import { useState } from "react";
import OrganizerEventCard from "@/components/OrganizerEventCard";
import type { OrganizerEvent } from "@/helpers/type";

function OrganizerEventsSection({
  events,
  organizer,
}: {
  events: OrganizerEvent[];
  organizer: string;
}) {
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  return (
    <section>
      <div className="mx-auto px-6 pb-14 lg:max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/80 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Your Events
          </h2>

          <Link
            href={`/${organizer}/dashboard/create`}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 sm:h-11 sm:w-auto"
          >
            Add Event
          </Link>
        </div>

        <div className="mt-6 space-y-5 sm:space-y-6">
          {events.map((event) => (
            <OrganizerEventCard
              key={event.id}
              event={event}
              open={openEventId === event.id}
              onToggle={() =>
                setOpenEventId((current) =>
                  current === event.id ? null : event.id,
                )
              }
            />
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

export default OrganizerEventsSection;

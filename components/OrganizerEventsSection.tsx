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
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto lg:max-w-7xl px-6 pb-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Your Events
          </h2>

          <Link
            href={`/${organizer}/dashboard/create`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white transition hover:bg-purple-800"
          >
            Add Event
          </Link>
        </div>

        <div className="mt-6 space-y-6">
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
    </section>
  );
}

export default OrganizerEventsSection;

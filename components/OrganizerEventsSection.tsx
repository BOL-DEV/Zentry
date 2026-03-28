"use client";

import OrganizerEventCard from "@/components/OrganizerEventCard";
import type { OrganizerEvent } from "@/helpers/type";

function OrganizerEventsSection({ events }: { events: OrganizerEvent[] }) {
  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto lg:max-w-7xl px-6 pb-14">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Your Events
        </h2>

        <div className="mt-6 space-y-6">
          {events.map((event) => (
            <OrganizerEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrganizerEventsSection;

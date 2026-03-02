'use client';
import OrganizerEventCard from './OrganizerEventCard';
import { organizerDemoEvents } from "@/data/demo";

export type TicketTypeBreak = {
  name: string;
  price: number;
  sold: number;
  total: number;
};

export type OrganizerEvent = {
  id: string;
  title: string;
  dateTimeText: string;
  capacitySold: number;
  capacityTotal: number;
  revenue: number;
  checkIns: number;
  ticketTypesCount: number;
  ticketTypes: TicketTypeBreak[];
};

const demoEvents: OrganizerEvent[] = organizerDemoEvents as OrganizerEvent[];

function OrganizerEventsSection({
  events = demoEvents,
}: {
  events?: OrganizerEvent[];
}) {
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

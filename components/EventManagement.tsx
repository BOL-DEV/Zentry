

import Link from "next/link";
import {  LuPlus } from "react-icons/lu";
import EventManagementCard from "./EventManagementCard";
import { adminDemoEvents } from "@/data/demo";

export type AdminEventSummary = {
  id: string;
  title: string;
  dateText: string;
  locationText: string;
  ticketsSold: number;
  revenue: number;
};



const demoEvents: AdminEventSummary[] = adminDemoEvents as AdminEventSummary[];

type Props = {
  events?: AdminEventSummary[];
};

function EventManagement({
  events = demoEvents,
}: Props) {
  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto lg:max-w-7xl px-6 pb-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Events Management
          </h2>

          <Link
            href="/dashboard/admin/events/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800 active:scale-[0.99]"
          >
            <LuPlus className="text-base" />
            Add Event
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          {events.map((event) => (
            <EventManagementCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventManagement;

import EventPageTitle from "@/components/EventPageTitle";
import AdminEventCard from "@/components/AdminEventCard";
import { getAllPublicEventsData } from "@/helpers/organizer-api";

async function Page() {
  const events = await getAllPublicEventsData();

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <EventPageTitle />

        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {events.map((event) => (
              <AdminEventCard
                key={`${event.id}-${event.dateTimeText}`}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            No public events are available right now.
          </div>
        )}
      </div>
    </main>
  );
}

export default Page;

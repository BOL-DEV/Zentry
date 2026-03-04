import { publicDemoEvents as events } from "@/data/demo";
import EventPageTitle from "@/components/EventPageTitle";
import AdminEventCard from "@/components/AdminEventCard";

function Page() {
  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <EventPageTitle />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {events.map((event) => (
            <AdminEventCard
              key={`${event.title}-${event.dateTimeText}`}
              event={event}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Page;

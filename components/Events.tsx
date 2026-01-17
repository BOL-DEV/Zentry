import EventCard from "@/components/EventCard";
import { publicDemoEvents } from "@/data/demo";

function Events() {
  return (
    <div className="flex mx-auto lg:max-w-7xl p-4 pt-28 pb-10 flex-col gap-10">
      <div className="flex flex-col gap-2 mb-4 ">
        <h1 className="text-5xl font-bold dark:text-white">Ongoing Events</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Discover and purchase tickets for upcoming events.
        </p>
      </div>

      {publicDemoEvents.map((event) => (
        <EventCard
          key={`${event.title}-${event.dateTimeText}`}
          imageUrl={event.imageUrl}
          title={event.title}
          description={event.description}
          dateTimeText={event.dateTimeText}
          locationText={event.locationText}
          dressCode={event.dressCode}
          policies={event.policies}
          ticketTypes={event.ticketTypes}
        />
      ))}
    </div>
  );
}

export default Events;

import EventCard from "@/components/EventCard";
import { publicDemoEvents } from "@/data/demo";
import EventPageTitle from "./EventPageTitle";

function Events() {
  return (
    <div className="flex mx-auto lg:max-w-7xl p-4 pt-28 pb-10 flex-col gap-10">
      <EventPageTitle />

      {publicDemoEvents.map((event) => (
        <EventCard
          key={event.id}
          id={event.id}
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

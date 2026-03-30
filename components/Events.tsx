import EventCard from "@/components/EventCard";
import type { EventCardProps } from "@/helpers/type";
import EventPageTitle from "./EventPageTitle";

const publicDemoEvents: EventCardProps[] = [
  {
    id: "event-product-design-meetup",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    title: "Product Design Meetup",
    description:
      "An evening of product thinking, design critiques, and practical conversations with builders.",
    dateTimeText: "April 18, 2026 at 6:00 PM",
    locationText: "Victoria Island, Lagos",
    dressCode: "Smart casual",
    policies: ["No refunds", "Tickets are transferable once"],
    ticketTypes: [
      {
        id: "early-bird",
        name: "Early Bird",
        price: 5000,
        remaining: 18,
        total: 50,
      },
      {
        id: "regular",
        name: "Regular",
        price: 8000,
        remaining: 44,
        total: 100,
      },
    ],
  },
  {
    id: "event-afrobeats-rooftop",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    title: "Afrobeats Rooftop Night",
    description:
      "Live DJs, skyline views, and a late-night social curated for music lovers.",
    dateTimeText: "May 2, 2026 at 8:30 PM",
    locationText: "Lekki Phase 1, Lagos",
    dressCode: "Nightlife chic",
    policies: ["18+ only", "Valid ticket required at entry"],
    ticketTypes: [
      {
        id: "standard",
        name: "Standard",
        price: 12000,
        remaining: 60,
        total: 150,
      },
      {
        id: "vip",
        name: "VIP",
        price: 25000,
        remaining: 14,
        total: 30,
      },
    ],
  },
];

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

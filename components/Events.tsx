import React from 'react'
import EventCard, { type EventCardProps } from "@/components/EventCard";



const dummyEvents: EventCardProps[] = [
  {
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
    title: "Startup Networking Mixer",
    description:
      "Connect with fellow entrepreneurs and investors in a relaxed atmosphere.",
    dateTimeText: "May 10, 2025 at 06:00 PM",
    locationText: "Downtown Innovation Hub",
    dressCode: "Business Casual",
    policies: [
      "Complimentary drinks and appetizers",
      "Networking materials provided",
      "Open to all experience levels",
    ],
    ticketTypes: [
      {
        name: "VIP Pass",
        description: "Priority seating + 1-on-1 with organizers",
        price: 79,
        remaining: 30,
        total: 75,
        buyHref: "#",
      },
      {
        name: "Regular",
        description: "General admission",
        price: 49,
        remaining: 120,
        total: 500,
        buyHref: "#",
      },
    ],
  },
  {
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
    title: "Product Design Meetup",
    description: "Lightning talks + portfolio feedback with other designers.",
    dateTimeText: "Jun 02, 2025 at 05:30 PM",
    locationText: "Riverside Co-Work",
    dressCode: "Smart Casual",
    policies: ["Bring your laptop", "Respect the time limits"],
    ticketTypes: [
      {
        name: "Early Bird",
        description: "Limited discounted entry",
        price: 19,
        remaining: 12,
        total: 100,
        buyHref: "#",
      },
      {
        name: "Standard",
        description: "General admission",
        price: 29,
        remaining: 67,
        total: 300,
        buyHref: "#",
      },
    ],
  },
  {
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
    title: "AI Builders Night",
    description:
      "Show what you’re building, meet collaborators, and learn from demos.",
    dateTimeText: "Jun 21, 2025 at 07:00 PM",
    locationText: "Tech Park Auditorium",
    dressCode: "Casual",
    policies: [
      "No pitch decks longer than 3 minutes",
      "Be respectful during Q&A",
    ],
    ticketTypes: [
      {
        name: "Builder Pass",
        description: "Demo slot included (limited)",
        price: 39,
        remaining: 8,
        total: 60,
        buyHref: "#",
      },
      {
        name: "Audience",
        description: "Watch the demos + networking",
        price: 25,
        remaining: 210,
        total: 400,
        buyHref: "#",
      },
    ],
  },
  {
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
    title: "Founders Breakfast",
    description: "Small-table conversations with founders over breakfast.",
    dateTimeText: "Jul 05, 2025 at 09:00 AM",
    locationText: "Skyline Cafe",
    dressCode: "Business Casual",
    policies: ["Arrive on time", "No hard selling"],
    ticketTypes: [
      {
        name: "Seat",
        description: "Breakfast included",
        price: 15,
        remaining: 5,
        total: 30,
        buyHref: "#",
      },
      {
        name: "Waitlist",
        description: "Join the waitlist",
        price: 0,
        remaining: 0,
        total: 0,
      },
    ],
  },
  {
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
    title: "Community Tech Talks",
    description: "Short talks from local builders + open networking after.",
    dateTimeText: "Aug 12, 2025 at 06:30 PM",
    locationText: "Main Library Hall",
    dressCode: "Casual",
    policies: ["Be kind", "No harassment", "Ask before taking photos"],
    ticketTypes: [
      {
        name: "Standard",
        description: "General admission",
        price: 10,
        remaining: 160,
        total: 250,
        buyHref: "#",
      },
      {
        name: "Supporter",
        description: "Helps fund the community",
        price: 25,
        remaining: 40,
        total: 80,
        buyHref: "#",
      },
    ],
  },
];

function Events() {

    return (
      <div className="flex mx-auto lg:max-w-7xl p-4 pt-28 pb-10 flex-col gap-10">
        <div className="flex flex-col gap-2 mb-4 ">
          <h1 className="text-5xl font-bold dark:text-white">Ongoing Events</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and purchase tickets for upcoming events.
          </p>
        </div>

        {dummyEvents.map((event) => (
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

export default Events

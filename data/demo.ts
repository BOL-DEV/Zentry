import type { EventCardProps } from "@/components/EventCard";
import { demoDateText, demoDateTimeText } from "@/helpers/date";

// Public / marketing events list
export const publicDemoEvents: EventCardProps[] = [
  {
    imageUrl:
      "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg",
    title: "Startup Networking Mixer",
    description:
      "Connect with fellow entrepreneurs and investors in a relaxed atmosphere.",
    dateTimeText: demoDateTimeText({ year: 2025, month: 5, day: 10, hour: 18, minute: 0 }),
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
    dateTimeText: demoDateTimeText({ year: 2025, month: 6, day: 2, hour: 17, minute: 30 }),
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
    dateTimeText: demoDateTimeText({ year: 2025, month: 6, day: 21, hour: 19, minute: 0 }),
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
    dateTimeText: demoDateTimeText({ year: 2025, month: 7, day: 5, hour: 9, minute: 0 }),
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
    dateTimeText: demoDateTimeText({ year: 2025, month: 8, day: 12, hour: 18, minute: 30 }),
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

// Organizer dashboard: cards with ticket breakdown
export const organizerDemoEvents = [
  {
    id: "tech-summit-2025",
    title: "Tech Summit 2025",
    dateTimeText: demoDateTimeText(
      { year: 2025, month: 6, day: 15, hour: 9, minute: 0 },
      { month: "long" }
    ),
    capacitySold: 1045,
    capacityTotal: 1600,
    revenue: 196_455,
    checkIns: 470,
    ticketTypesCount: 3,
    ticketTypes: [
      { name: "VIP Pass", price: 299, sold: 45, total: 100 },
      { name: "Early Bird", price: 149, sold: 320, total: 500 },
      { name: "Regular", price: 199, sold: 680, total: 1000 },
    ],
  },
  {
    id: "design-workshop",
    title: "Design Workshop",
    dateTimeText: demoDateTimeText(
      { year: 2025, month: 5, day: 20, hour: 14, minute: 0 },
      { month: "long" }
    ),
    capacitySold: 622,
    capacityTotal: 850,
    revenue: 102_128,
    checkIns: 279,
    ticketTypesCount: 3,
    ticketTypes: [
      { name: "VIP Pass", price: 199, sold: 22, total: 50 },
      { name: "Early Bird", price: 99, sold: 240, total: 350 },
      { name: "Regular", price: 149, sold: 360, total: 450 },
    ],
  },
  {
    id: "startup-networking-mixer",
    title: "Startup Networking Mixer",
    dateTimeText: demoDateTimeText(
      { year: 2025, month: 5, day: 10, hour: 18, minute: 0 },
      { month: "long" }
    ),
    capacitySold: 425,
    capacityTotal: 575,
    revenue: 22_175,
    checkIns: 191,
    ticketTypesCount: 2,
    ticketTypes: [
      { name: "VIP Pass", price: 79, sold: 30, total: 75 },
      { name: "Regular", price: 49, sold: 395, total: 500 },
    ],
  },
];

// Admin dashboard: events management list
export const adminDemoEvents = [
  {
    id: "tech-summit-2025",
    title: "Tech Summit 2025",
    dateText: demoDateText({ year: 2025, month: 6, day: 15 }),
    locationText: "San Francisco Convention Center",
    ticketsSold: 1045,
    revenue: 196_455,
  },
  {
    id: "design-workshop",
    title: "Design Workshop",
    dateText: demoDateText({ year: 2025, month: 5, day: 20 }),
    locationText: "New York Creative Studios",
    ticketsSold: 622,
    revenue: 102_128,
  },
  {
    id: "startup-networking-mixer",
    title: "Startup Networking Mixer",
    dateText: demoDateText({ year: 2025, month: 5, day: 10 }),
    locationText: "Downtown Innovation Hub",
    ticketsSold: 425,
    revenue: 22_175,
  },
];

// Admin dashboard: organizers list
export const adminDemoOrganizers = [
  {
    id: "eventflow-inc",
    name: "EventFlow Inc.",
    email: "organizer@eventflow.com",
    eventsCount: 3,
    status: "Active",
    manageHref: "#",
  },
  {
    id: "tech-events-ltd",
    name: "Tech Events Ltd",
    email: "tech@events.com",
    eventsCount: 5,
    status: "Active",
    manageHref: "#",
  },
  {
    id: "design-collective",
    name: "Design Collective",
    email: "design@collective.com",
    eventsCount: 2,
    status: "Active",
    manageHref: "#",
  },
] as const;

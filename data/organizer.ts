import type { EventCardProps } from "@/helpers/type";
import { organizerDemoEvents, publicDemoEvents } from "@/data/demo";

export type OrganizerStats = {
  eventsCount: number;
  ticketsSold: number;
};

export type OrganizerPastEvent = {
  id: string;
  title: string;
  dateText: string;
  ticketsSold: number;
  imageUrl: string;
};

export type OrganizerSocialLinks = {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
};

export type OrganizerProfile = {
  name: string;
  logo: string;
  tagline: string;
  description: string;
  themeColor: string;
  stats: OrganizerStats;
  upcomingEvents: EventCardProps[];
  pastEvents: OrganizerPastEvent[];
  socialLinks: OrganizerSocialLinks;
};

function formatOrganizerTitle(slug: string) {
  const cleaned = slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Organizer";

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function fetchOrganizer(slug: string): Promise<OrganizerProfile> {
  // Mock async without adding artificial latency.
  await Promise.resolve();

  const name = formatOrganizerTitle(slug);

  const upcomingEvents: EventCardProps[] = publicDemoEvents.map((event) => ({
    ...event,
    ticketTypes: event.ticketTypes.map((ticket) => ({
      ...ticket,
      buyHref: ticket.buyHref ? `/${slug}/events/${event.id}/checkout` : undefined,
    })),
  }));

  const fallbackImageUrl =
    publicDemoEvents[0]?.imageUrl ??
    "https://v0-event-web-app-prototype.vercel.app/networking-event-elegant-venue.jpg";

  const pastEvents: OrganizerPastEvent[] = organizerDemoEvents.map((event) => {
    const matchingPublicEvent = publicDemoEvents.find(
      (item) => item.id === event.id,
    );

    return {
      id: event.id,
      title: event.title,
      dateText: event.dateTimeText,
      ticketsSold: event.capacitySold,
      imageUrl: matchingPublicEvent?.imageUrl ?? fallbackImageUrl,
    };
  });

  const ticketsSold = organizerDemoEvents.reduce(
    (sum, event) => sum + (event.capacitySold ?? 0),
    0,
  );

  const stats: OrganizerStats = {
    eventsCount: pastEvents.length,
    ticketsSold,
  };

  return {
    name,
    logo: "⚡",
    tagline: "Creating unforgettable experiences",
    description:
      "We host community-first events designed to connect people, spotlight great ideas, and create moments worth remembering. Expect thoughtful venues, clear schedules, and a welcoming atmosphere for everyone.",
    themeColor: "#9333ea",
    stats,
    upcomingEvents,
    pastEvents,
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://x.com",
      linkedin: "https://linkedin.com",
    },
  };
}

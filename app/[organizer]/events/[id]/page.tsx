import { notFound } from "next/navigation";

import AdminEventDetails from "@/components/AdminEventDetails";
import { publicDemoEvents } from "@/data/demo";
import type { EventCardProps } from "@/helpers/type";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

function getOrganizerDisplayName(slug: string) {
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

async function Page({ params }: Props) {
  const { organizer, id } = await params;
  const baseEvent = publicDemoEvents.find((item) => item.id === id);

  if (!baseEvent) notFound();

  const event: EventCardProps = {
    ...baseEvent,
    ticketTypes: baseEvent.ticketTypes.map((ticket) => ({
      ...ticket,
      buyHref: ticket.buyHref
        ? `/${organizer}/events/${baseEvent.id}/checkout`
        : undefined,
    })),
  };

  return (
    <AdminEventDetails
      event={event}
      backHref={`/${organizer}/events`}
      organizerSlug={organizer}
      organizer={{
        name: getOrganizerDisplayName(organizer),
        tagline: "Creating Unforgettable Experiences",
        profileHref: `/${organizer}`,
      }}
    />
  );
}

export default Page;

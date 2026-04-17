import OrganizerEditEventClient from "@/components/OrganizerEditEventClient";

type Props = {
  params: Promise<{
    organizer: string;
    id: string;
  }>;
};

async function OrganizerEditEventPage({ params }: Props) {
  const { organizer, id } = await params;

  return <OrganizerEditEventClient organizer={organizer} eventId={id} />;
}

export default OrganizerEditEventPage;

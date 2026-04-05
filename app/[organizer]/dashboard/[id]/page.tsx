import OrganizerDashboardEventDetailsClient from "@/components/OrganizerDashboardEventDetailsClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;

  return <OrganizerDashboardEventDetailsClient organizer={organizer} eventId={id} />;
}

export default Page;

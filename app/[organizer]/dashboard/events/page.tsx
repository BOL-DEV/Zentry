import OrganizerDashboardEventsClient from "@/components/OrganizerDashboardEventsClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerDashboardEventsClient organizer={organizer} />;
}

export default Page;

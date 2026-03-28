import OrganizerEventsPageClient from "@/components/OrganizerEventsPageClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerEventsPageClient organizer={organizer} />;
}

export default Page;

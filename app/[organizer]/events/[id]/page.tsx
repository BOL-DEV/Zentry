import OrganizerEventDetailsClient from "@/components/OrganizerEventDetailsClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;

  return <OrganizerEventDetailsClient organizer={organizer} eventId={id} />;
}

export default Page;

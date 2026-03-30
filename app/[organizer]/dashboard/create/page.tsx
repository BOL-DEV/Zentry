import OrganizerCreateEventClient from "@/components/OrganizerCreateEventClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerCreateEventClient organizer={organizer} />;
}

export default Page;

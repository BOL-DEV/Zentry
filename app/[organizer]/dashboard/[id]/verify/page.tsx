import OrganizerVerifyPageClient from "@/components/OrganizerVerifyPageClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;

  return <OrganizerVerifyPageClient organizer={organizer} eventId={id} />;
}

export default Page;

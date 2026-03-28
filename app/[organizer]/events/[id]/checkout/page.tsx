import OrganizerCheckoutClient from "@/components/OrganizerCheckoutClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;

  return <OrganizerCheckoutClient organizer={organizer} eventId={id} />;
}

export default Page;

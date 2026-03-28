import OrganizerHomeClient from "@/components/OrganizerHomeClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerHomeClient organizer={organizer} />;
}

export default Page;

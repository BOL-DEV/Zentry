import OrganizerAttendeesPageClient from "@/components/OrganizerAttendeesPageClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerAttendeesPageClient organizer={organizer} />;
}

export default Page;

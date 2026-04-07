import OrganizerStaffSessionsClient from "@/components/OrganizerStaffSessionsClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerStaffSessionsClient organizer={organizer} />;
}

export default Page;

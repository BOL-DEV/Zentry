import OrganizerDashboardClient from "@/components/OrganizerDashboardClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerDashboardClient organizer={organizer} />;
}

export default Page;

import OrganizerStaffDashboardClient from "@/components/OrganizerStaffDashboardClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerStaffDashboardClient organizer={organizer} />;
}

export default Page;

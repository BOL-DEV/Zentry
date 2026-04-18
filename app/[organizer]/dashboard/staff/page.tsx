import OrganizerStaffManagementClient from "@/components/OrganizerStaffManagementClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerStaffManagementClient organizer={organizer} />;
}

export default Page;

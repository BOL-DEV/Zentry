import OrganizerChangePasswordClient from "@/components/OrganizerChangePasswordClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerChangePasswordClient organizer={organizer} />;
}

export default Page;

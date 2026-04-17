import OrganizerEditProfileClient from "@/components/OrganizerEditProfileClient";

type Props = {
  params: Promise<{
    organizer: string;
  }>;
};

async function OrganizerProfilePage({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerEditProfileClient organizer={organizer} />;
}

export default OrganizerProfilePage;

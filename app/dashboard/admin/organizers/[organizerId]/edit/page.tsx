import AdminEditOrganizerClient from "@/components/AdminEditOrganizerClient";

type Props = {
  params: Promise<{
    organizerId: string;
  }>;
};

async function AdminEditOrganizerPage({ params }: Props) {
  const { organizerId } = await params;

  return <AdminEditOrganizerClient organizerId={organizerId} />;
}

export default AdminEditOrganizerPage;

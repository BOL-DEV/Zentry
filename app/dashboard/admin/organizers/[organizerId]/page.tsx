import AdminOrganizerDetailsClient from "@/components/AdminOrganizerDetailsClient";

type Props = {
  params: Promise<{
    organizerId: string;
  }>;
};

async function AdminOrganizerDetailsPage({ params }: Props) {
  const { organizerId } = await params;

  return <AdminOrganizerDetailsClient organizerId={organizerId} />;
}

export default AdminOrganizerDetailsPage;

import AdminOrganizerRequestDetailsClient from "@/components/AdminOrganizerRequestDetailsClient";

type Props = {
  params: Promise<{ requestId: string }>;
};

async function AdminOrganizerRequestDetailsPage({ params }: Props) {
  const { requestId } = await params;

  return <AdminOrganizerRequestDetailsClient requestId={requestId} />;
}

export default AdminOrganizerRequestDetailsPage;

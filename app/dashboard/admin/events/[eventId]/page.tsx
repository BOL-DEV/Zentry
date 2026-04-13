import AdminEventDetailsClient from "@/components/AdminEventDetailsClient";

type Props = {
  params: Promise<{
    eventId: string;
  }>;
};

async function AdminEventDetailsPage({ params }: Props) {
  const { eventId } = await params;

  return <AdminEventDetailsClient eventId={eventId} />;
}

export default AdminEventDetailsPage;

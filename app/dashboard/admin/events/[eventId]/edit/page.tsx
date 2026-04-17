import AdminEditEventClient from "@/components/AdminEditEventClient";

type Props = {
  params: Promise<{
    eventId: string;
  }>;
};

async function AdminEditEventPage({ params }: Props) {
  const { eventId } = await params;

  return <AdminEditEventClient eventId={eventId} />;
}

export default AdminEditEventPage;

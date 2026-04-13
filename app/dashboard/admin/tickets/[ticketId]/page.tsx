import AdminTicketDetailsClient from "@/components/AdminTicketDetailsClient";

type Props = {
  params: Promise<{
    ticketId: string;
  }>;
};

async function AdminTicketDetailsPage({ params }: Props) {
  const { ticketId } = await params;

  return <AdminTicketDetailsClient ticketId={ticketId} />;
}

export default AdminTicketDetailsPage;

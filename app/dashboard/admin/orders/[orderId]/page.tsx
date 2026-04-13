import AdminOrderDetailsClient from "@/components/AdminOrderDetailsClient";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

async function AdminOrderDetailsPage({ params }: Props) {
  const { orderId } = await params;

  return <AdminOrderDetailsClient orderId={orderId} />;
}

export default AdminOrderDetailsPage;

import { Suspense } from "react";
import OrderStatusLookupClient from "@/components/OrderStatusLookupClient";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={null}>
      <OrderStatusLookupClient initialOrderId={params.orderId || ""} />
    </Suspense>
  );
}

export default Page;

import { Suspense } from "react";

import AdminOrdersClient from "@/components/AdminOrdersClient";

function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersClient />
    </Suspense>
  );
}

export default AdminOrdersPage;

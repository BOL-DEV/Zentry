import { Suspense } from "react";

import AdminTicketsClient from "@/components/AdminTicketsClient";

function AdminTicketsPage() {
  return (
    <Suspense fallback={null}>
      <AdminTicketsClient />
    </Suspense>
  );
}

export default AdminTicketsPage;

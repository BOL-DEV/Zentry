import { Suspense } from "react";

import AdminEventsClient from "@/components/AdminEventsClient";

function AdminEventsPage() {
  return (
    <Suspense fallback={null}>
      <AdminEventsClient />
    </Suspense>
  );
}

export default AdminEventsPage;

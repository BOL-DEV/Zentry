import { Suspense } from "react";

import AdminOrganizerRequestsClient from "@/components/AdminOrganizerRequestsClient";

function AdminOrganizerRequestsPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrganizerRequestsClient />
    </Suspense>
  );
}

export default AdminOrganizerRequestsPage;

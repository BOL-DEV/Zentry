import { Suspense } from "react";

import AdminOrganizersClient from "@/components/AdminOrganizersClient";

function AdminOrganizersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrganizersClient />
    </Suspense>
  );
}

export default AdminOrganizersPage;

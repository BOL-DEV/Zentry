import { Suspense } from "react";

import OrganizerStaffSessionsClient from "@/components/OrganizerStaffSessionsClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return (
    <Suspense fallback={null}>
      <OrganizerStaffSessionsClient organizer={organizer} />
    </Suspense>
  );
}

export default Page;

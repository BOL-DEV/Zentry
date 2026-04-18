import { Suspense } from "react";

import OrganizerCheckoutClient from "@/components/OrganizerCheckoutClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;

  return (
    <Suspense fallback={null}>
      <OrganizerCheckoutClient organizer={organizer} eventId={id} />
    </Suspense>
  );
}

export default Page;

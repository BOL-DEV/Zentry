import OrganizerPaymentCallbackClient from "@/components/OrganizerPaymentCallbackClient";

type Props = {
  params: Promise<{ organizer: string; slug: string[] }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerPaymentCallbackClient organizer={organizer} />;
}

export default Page;

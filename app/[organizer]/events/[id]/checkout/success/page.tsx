import OrganizerCheckoutSuccessClient from "@/components/OrganizerCheckoutSuccessClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerCheckoutSuccessClient organizer={organizer} />;
}

export default Page;

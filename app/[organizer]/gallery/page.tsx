import OrganizerGalleryClient from "@/components/OrganizerGalleryClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerGalleryClient organizer={organizer} />;
}

export default Page;

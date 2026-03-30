import OrganizerCreateGalleryClient from "@/components/OrganizerCreateGalleryClient";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerCreateGalleryClient organizer={organizer} />;
}

export default Page;

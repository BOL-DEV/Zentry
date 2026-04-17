import OrganizerManageGalleryClient from "@/components/OrganizerManageGalleryClient";

type Props = {
  params: Promise<{
    organizer: string;
  }>;
};

async function OrganizerManageGalleryPage({ params }: Props) {
  const { organizer } = await params;

  return <OrganizerManageGalleryClient organizer={organizer} />;
}

export default OrganizerManageGalleryPage;

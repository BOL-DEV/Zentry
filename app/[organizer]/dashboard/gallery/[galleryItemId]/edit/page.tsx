import OrganizerEditGalleryClient from "@/components/OrganizerEditGalleryClient";

type Props = {
  params: Promise<{
    organizer: string;
    galleryItemId: string;
  }>;
};

async function OrganizerEditGalleryPage({ params }: Props) {
  const { organizer, galleryItemId } = await params;

  return (
    <OrganizerEditGalleryClient
      organizer={organizer}
      galleryItemId={galleryItemId}
    />
  );
}

export default OrganizerEditGalleryPage;

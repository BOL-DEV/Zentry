import PlatformOrganizersDirectory from "@/components/PlatformOrganizersDirectory";
import { getPublicOrganizers } from "@/helpers/organizer-api";

async function OrganizersPage() {
  const organizers = await getPublicOrganizers().catch(() => []);

  return <PlatformOrganizersDirectory organizers={organizers} />;
}

export default OrganizersPage;

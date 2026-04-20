"use client";

import { useParams, usePathname } from "next/navigation";
import type { OrganizerProfile } from "@/helpers/type";
import Footer from "@/components/Footer";
import OrganizerFooterMenu from "@/components/OrganizerFooterMenu";
import OrganizerHeader from "@/components/OrganizerHeader";

type Props = {
  children: React.ReactNode;
  organizerBranding?: Pick<
    OrganizerProfile,
    "name" | "logo" | "tagline" | "description" | "socialLinks"
  >;
};

function OrganizerShell({ children, organizerBranding }: Props) {
  const pathname = usePathname();
  const params = useParams<{ organizer?: string }>();
  const organizer = params?.organizer;
  const organizerRoot = organizer ? `/${organizer}` : "";
  const isDashboardWorkspace = organizer
    ? pathname === `${organizerRoot}/dashboard` ||
      pathname.startsWith(`${organizerRoot}/dashboard/`) ||
      pathname === `${organizerRoot}/staff` ||
      pathname.startsWith(`${organizerRoot}/staff/`)
    : false;

  if (isDashboardWorkspace) {
    return <div className="min-h-screen antialiased">{children}</div>;
  }

  return (
    <div className="min-h-screen antialiased flex flex-col">
      <OrganizerHeader organizerBranding={organizerBranding} />
      <main className="flex-1">{children}</main>

      <Footer>
        <OrganizerFooterMenu organizerBranding={organizerBranding} />
      </Footer>
    </div>
  );
}

export default OrganizerShell;

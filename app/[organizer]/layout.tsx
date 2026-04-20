import React from "react";
import OrganizerShell from "@/components/OrganizerShell";
import { getOrganizerBranding } from "@/helpers/organizer-api";

interface Props {
  children: React.ReactNode;
  params: Promise<{ organizer: string }>;
}

async function OrganizerLayout(props: Props) {
  const { children, params } = props;
  const { organizer } = await params;
  const organizerBranding = await getOrganizerBranding(organizer).catch(() => null);

  return <OrganizerShell organizerBranding={organizerBranding || undefined}>{children}</OrganizerShell>;
}

export default OrganizerLayout;

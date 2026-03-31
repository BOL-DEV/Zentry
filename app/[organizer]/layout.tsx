import React from "react";
import OrganizerShell from "@/components/OrganizerShell";

interface Props {
  children: React.ReactNode;
}

function OrganizerLayout(props: Props) {
  const { children } = props;

  return <OrganizerShell>{children}</OrganizerShell>;
}

export default OrganizerLayout;

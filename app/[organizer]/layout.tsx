import React from "react";
import Footer from "@/components/Footer";
import OrganizerHeader from "@/components/OrganizerHeader";
import OrganizerFooterMenu from "@/components/OrganizerFooterMenu";

interface Props {
  children: React.ReactNode;
}

function OrganizerLayout(props: Props) {
  const { children } = props;

  return (
    <div className={`min-h-screen antialiased flex flex-col`}>
      <OrganizerHeader />
      <main className="flex-1">{children}</main>

      <Footer>
        <OrganizerFooterMenu />
      </Footer>
    </div>
  );
}

export default OrganizerLayout;

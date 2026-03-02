import type { Metadata } from "next";
// import Footer from "@/components/Footer";
import OrganizerHeader from "@/components/OrganizerHeader";


export const metadata: Metadata = {
  title: "PulseEvent",
  description: "A minimal workspace to sketch ideas fast.",
};

export default function OrganizerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div
        className={`min-h-screen antialiased flex flex-col`}
      >
        <OrganizerHeader />
        <main className="flex-1">{children}</main>
        {/* <Footer /> */}
      </div>
  );
}

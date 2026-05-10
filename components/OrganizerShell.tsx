"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { LuArrowUpLeft } from "react-icons/lu";
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
      <Link
        href="/"
        aria-label="Return to Zentra platform home"
        className="fixed bottom-5 left-1/2 z-40 inline-flex h-12 -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-purple-300/70 bg-white/90 px-5 text-sm font-semibold text-purple-700 shadow-[0_18px_45px_rgba(88,28,135,0.18)] backdrop-blur transition hover:-translate-x-1/2 hover:-translate-y-0.5 hover:bg-purple-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300/50 dark:border-white/10 dark:bg-slate-900/85 dark:text-white dark:hover:bg-slate-800 md:bottom-6 md:left-6 md:translate-x-0 md:hover:translate-x-0"
      >
        <LuArrowUpLeft className="text-base" />
        Back to Zentra
      </Link>

      <Footer>
        <OrganizerFooterMenu organizerBranding={organizerBranding} />
      </Footer>
    </div>
  );
}

export default OrganizerShell;

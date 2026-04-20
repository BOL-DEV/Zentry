"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { OrganizerProfile } from "@/helpers/type";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import MobileMenuToggle from "./MobileMenuToggle";
import ThemeToggle from "./ThemeToggle";

const menuData = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Events",
    href: "/events",
  },
  {
    name: "Gallery",
    href: "/gallery",
  },
];

type Props = {
  organizerBranding?: Pick<OrganizerProfile, "name" | "logo">;
};

function getOrganizerLogoMark(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "O";
}

function OrganizerHeader({ organizerBranding }: Props) {
  const params = useParams<{ organizer?: string }>();
  const organizer = params?.organizer;
  const homeLink = organizer ? `/${organizer}` : "/";
  const organizerName = organizerBranding?.name || organizer || "Organizer";
  const logoSrc = organizerBranding?.logo || getOrganizerLogoMark(organizerName);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
      <div className="mx-auto flex items-center justify-between px-6 py-4 lg:max-w-7xl">
        <Logo homeLink={homeLink} name={organizerName} logoSrc={logoSrc} />

        <div className="flex items-center gap-3">
          <HeaderMenu menuData={menuData} />
          <Link
            href="/login"
            className="hidden h-10 items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 md:inline-flex"
          >
            Login
          </Link>
          <ThemeToggle />
          <MobileMenuToggle menuData={menuData} showLogin />
        </div>
      </div>
    </header>
  );
}

export default OrganizerHeader;

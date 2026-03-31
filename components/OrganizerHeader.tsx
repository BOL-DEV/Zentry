"use client";

import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import MobileMenuToggle from "./MobileMenuToggle";
import HeaderMenu from "./HeaderMenu";
import { useParams } from "next/navigation";

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
  {
    name: "Contact",
    href: "/contact",
  },
];

const logoData = {
  name: "PulseEvent",
  logoSrc: "⚡",
};

function OrganizerHeader() {
  const params = useParams<{ organizer?: string }>();
  const organizer = params?.organizer;
  const homeLink = organizer ? `/${organizer}` : "/";

  return (
    <header className="border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white fixed top-0 w-full z-50">
      <div className="mx-auto flex lg:max-w-7xl items-center justify-between px-6 py-4">
        {logoData && (
          <Logo
            homeLink={homeLink}
            name={logoData.name}
            logoSrc={logoData.logoSrc}
          />
        )}

        <div className=" flex items-center gap-3 ">
          <HeaderMenu menuData={menuData} />
          <Link
            href="/login"
            className="hidden h-10 items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 md:inline-flex"
          >
            Login
          </Link>
          <ThemeToggle />
          <MobileMenuToggle menuData={menuData} />
        </div>
      </div>
    </header>
  );
}

export default OrganizerHeader;

"use client";

import Link from "next/link";
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
    name: "Organizers",
    href: "/organizers",
  },
  {
    name: "Events",
    href: "/events",
  },
  {
    name: "Offers",
    href: "/offers",
  },
  {
    name: "Contact",
    href: "/contact-us",
  },
];

const logoData = {
  name: "Zentra",
};

function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
      <div className="mx-auto flex items-center justify-between px-6 py-4 lg:max-w-7xl">
        {logoData && <Logo homeLink="/" name={logoData.name} />}

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

export default Header;

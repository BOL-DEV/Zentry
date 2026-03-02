"use client";

import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import MobileMenuToggle from "./MobileMenuToggle";
import HeaderMenu from "./HeaderMenu";

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
  return (
    <header className="border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white fixed top-0 w-full z-50">
      <div className="mx-auto flex lg:max-w-7xl items-center justify-between px-6 py-4">
        {logoData && (
          <Logo homeLink="/" name={logoData.name} logoSrc={logoData.logoSrc} />
        )}

        <div className=" flex items-center gap-3 ">
          <HeaderMenu menuData={menuData} />
          <ThemeToggle />
          <MobileMenuToggle menuData={menuData} />
        </div>
      </div>
    </header>
  );
}

export default OrganizerHeader;

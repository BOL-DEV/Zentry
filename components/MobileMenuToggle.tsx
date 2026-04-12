"use client"


import { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { mobileMenuProps } from "../helpers/type";
import { useParams, usePathname } from "next/navigation";

function MobileMenuToggle(props: mobileMenuProps) {
  const { menuData, showLogin = false, loginHref = "/login" } = props;
  const { organizer } = useParams<{ organizer?: string }>();
  const pathname = usePathname();

  const handleUrl = (href: string) => {
    if (href.startsWith("/#") || href.startsWith("#")) return href;
    if (organizer) return `/${organizer}${href}`;
    return href;
  };

  const isActive = (href: string) => {
    if (!pathname) return false;

    if (href === "/") {
      return organizer ? pathname === `/${organizer}` : pathname === "/";
    }

    if (href.startsWith("/#") || href.startsWith("#")) {
      const normalized = href.replace(/^\/#/, "").replace(/^#/, "");
      return pathname === `/${normalized}` || pathname.endsWith(`/${normalized}`);
    }

    const target = organizer ? `/${organizer}${href}` : href;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile hamburger (outside the nav container) */}
      <button
        type="button"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        className=" text-slate-900 ml-2 text-2xl transition dark:border-white/10  dark:text-white lg:hidden"
        onClick={() => setIsMobileMenuOpen((open) => !open)}
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen ? (
        <div className="lg:hidden border-t border-purple-200/70 dark:border-white/10 absolute top-full left-0 w-full z-20">
          <div className="bg-purple-200 p-4 text-slate-900 dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
            <ul
              className="flex list-none flex-col gap-3 text-sm font-semibold"
              onClick={handleMenuToggle}
            >
              {menuData.map((item) => (
                <Link
                  key={item.name}
                  href={handleUrl(item.href)}
                  className={`block rounded-lg px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10 ${
                    isActive(item.href)
                      ? "bg-white text-purple-700 dark:bg-white/10 dark:text-white"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {showLogin ? (
                <Link
                  href={loginHref}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Login
                </Link>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MobileMenuToggle

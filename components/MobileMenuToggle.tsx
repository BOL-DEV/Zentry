"use client"


import { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { menuDataProps } from "../helpers/type";
import { useParams } from "next/navigation";

function MobileMenuToggle(props: menuDataProps) {
  const { menuData } = props;
  const { organizer } = useParams<{ organizer?: string }>();

  const handleUrl = (href: string) => {
    if (organizer) return `/${organizer}${href}`;
    return href;
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
                  className="block rounded-lg px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10"
                >
                  {item.name}
                </Link>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MobileMenuToggle

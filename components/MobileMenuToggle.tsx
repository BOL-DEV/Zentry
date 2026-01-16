"use client"


import { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';

interface Props{
    role?:string
}

function MobileMenuToggle(props: Props) {
    const {role} = props
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
            <div className="bg-purple-200 p-4 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <ul
                className="flex list-none flex-col gap-3 text-sm font-semibold"
                onClick={handleMenuToggle}
              >
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10"
                >
                  Home
                </Link>

                <Link
                  href="/events"
                  className="block rounded-lg px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10"
                >
                  Events
                </Link>

                {role ? (
                  <Link
                    href={`/${role}/dashboard`}
                    className="block rounded-lg capitalize px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10"
                  >
                    {role}
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/organizer"
                    className="block rounded-lg px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10"
                  >
                    Login
                  </Link>
                )}

                {role ? (
                  <Link
                    href="/"
                    className="block rounded-lg bg-purple-600 px-3 py-2 font-bold text-white transition hover:bg-purple-700"
                  >
                    Logout
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/admin"
                    className="block rounded-lg bg-purple-600 px-3 py-2 font-bold text-white transition hover:bg-purple-700"
                  >
                    Admin
                  </Link>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </>
    );
}

export default MobileMenuToggle

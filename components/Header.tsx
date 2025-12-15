"use client";

import Link from "next/link";
import React, { useState } from "react";
import { FaRegMoon } from "react-icons/fa";
import { IoSunnyOutline } from "react-icons/io5";
import { FiMenu, FiX } from "react-icons/fi";

function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  }

 

  const handleThemeToggle = () => {
    const html = document.documentElement;
    const preferredTheme = localStorage.getItem("theme");

    html.classList.toggle("dark");

    if (html.classList.contains("dark") && preferredTheme !== "dark") {
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    } else if (!html.classList.contains("dark") && preferredTheme === "dark") {
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    }
    console.log(isDarkMode);
  };

  return (
    <header className="border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 dark:text-white">
      <div className="mx-auto flex lg:max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-2xl">
            ⚡
          </span>
          <span className="text-purple-600 text-xl font-bold">EventFlow</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center">
            {/* Desktop links */}
            <ul className="hidden list-none items-center gap-8 pr-6 text-xs font-medium uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300 lg:flex">
              <li>
                <Link
                  href="/"
                  className="font-semibold transition hover:text-purple-700 dark:hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="font-semibold transition hover:text-purple-700 dark:hover:text-white"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/organizer/dashboard"
                  className="font-semibold transition hover:text-purple-700 dark:hover:text-white"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-700"
                >
                  Admin
                </Link>
              </li>
            </ul>

            <button
              type="button"
              aria-label="Toggle theme"
              className="ml-0 rounded-lg p-3 text-lg font-bold text-slate-900 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10  lg:border-purple-200/70  dark:lg:border-white/10"
              onClick={handleThemeToggle}
            >
              {isDarkMode ? <IoSunnyOutline /> : <FaRegMoon />}
            </button>

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
          </nav>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen ? (
        <div className="lg:hidden border-t border-purple-200/70 dark:border-white/10">
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

              <Link
                href="/organizer/dashboard"
                className="block rounded-lg px-3 py-2 transition hover:bg-purple-100 dark:hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                href="/admin/dashboard"
                className="block rounded-lg bg-purple-600 px-3 py-2 font-bold text-white transition hover:bg-purple-700"
              >
                Admin
              </Link>
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Header;

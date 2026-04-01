"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FaRegMoon } from "react-icons/fa";
import { IoSunnyOutline } from "react-icons/io5";

function resolveThemePreference() {
  const preferredTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  ).matches;

  return preferredTheme ? preferredTheme === "dark" : Boolean(systemPrefersDark);
}

function ThemeToggle() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return resolveThemePreference();
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-lg font-bold text-slate-900 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
      onClick={handleThemeToggle}
    >
      {isHydrated ? (
        isDarkMode ? <IoSunnyOutline /> : <FaRegMoon />
      ) : (
        <span className="block h-[1em] w-[1em]" aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;

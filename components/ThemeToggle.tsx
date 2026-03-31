"use client"

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
      className="ml-0 rounded-lg p-3 text-lg font-bold text-slate-900 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10 lg:border-purple-200/70 dark:lg:border-white/10"
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

export default ThemeToggle

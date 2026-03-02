"use client"

import { useEffect, useState } from "react";
import { FaRegMoon } from "react-icons/fa";
import { IoSunnyOutline } from "react-icons/io5";

function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const preferredTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches;

    const shouldUseDark = preferredTheme
      ? preferredTheme === "dark"
      : Boolean(systemPrefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }, []);

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
      {isDarkMode ? <IoSunnyOutline /> : <FaRegMoon />}
    </button>
  );
}

export default ThemeToggle

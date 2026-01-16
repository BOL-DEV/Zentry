"use client"

import { useState } from "react"
import { FaRegMoon } from "react-icons/fa";
import { IoSunnyOutline } from "react-icons/io5";

function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      <button
        type="button"
        aria-label="Toggle theme"
        className="ml-0 rounded-lg p-3 text-lg font-bold text-slate-900 transition hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10  lg:border-purple-200/70  dark:lg:border-white/10"
        onClick={handleThemeToggle}
      >
        {isDarkMode ? <IoSunnyOutline /> : <FaRegMoon />}
      </button>
    );
}

export default ThemeToggle

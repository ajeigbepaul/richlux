"use client";

import { FaSun, FaMoon } from "react-icons/fa";
import { useThemeMode } from "@/lib/ThemeContext";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${className}`}
    >
      {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
    </button>
  );
}

export default ThemeToggle;

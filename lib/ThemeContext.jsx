"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "richlux-theme";

const ThemeModeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

// Applies to the whole app (public site + admin). Defaults to the visitor's
// OS/browser preference on first visit; a manual toggle overrides and
// persists via localStorage. The inline script in app/layout.js sets the
// `dark` class before hydration so there's no flash of the wrong theme --
// this provider just keeps React state in sync with that class afterward.
export function ThemeModeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // Reads browser-only APIs (localStorage/matchMedia), unavailable during SSR
  // render -- this is one of the standard valid uses of an effect (syncing
  // with an external system), not state derivable from props/render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeModeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

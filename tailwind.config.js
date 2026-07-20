const tokens = require("./design-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: tokens.brand,
        ink: tokens.ink,
        surface: tokens.surface,
        accent: tokens.accent,
        success: tokens.success,
        warning: tokens.warning,
        danger: tokens.danger,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-rochester)", "cursive"],
      },
      fontSize: {
        "display-lg": ["4.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        "display-md": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
      },
      boxShadow: {
        // Card surfaces rely on background/border contrast, not a drop
        // shadow, to read as elevated -- kept as a named token (rather than
        // stripping the `shadow-card` class from every usage) so there's one
        // place to change if that ever needs to come back.
        card: "none",
        glow: "0 0 15px 0 rgba(58,183,227,0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-blob":
          "radial-gradient(ellipse at top right, theme(colors.brand.300), transparent 60%)",
        // Tighter, corner-confined version for the landing page hero --
        // light mode only (dark mode hides it entirely in favor of a solid
        // background), so it reads as an accent in the corner rather than a
        // wash across the whole section.
        "brand-blob-corner":
          "radial-gradient(ellipse 45% 55% at top right, theme(colors.brand.200), transparent 70%)",
      },
    },
  },
  plugins: [],
};

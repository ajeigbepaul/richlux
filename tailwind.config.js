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
        card: "0 4px 20px rgba(0,0,0,0.08)",
        glow: "0 0 15px 0 rgba(58,183,227,0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-blob":
          "radial-gradient(ellipse at top right, theme(colors.brand.300), transparent 60%)",
      },
    },
  },
  plugins: [],
};

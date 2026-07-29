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
        gold: tokens.gold,
        success: tokens.success,
        warning: tokens.warning,
        danger: tokens.danger,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-rochester)", "cursive"],
        // Reserved for headings/prices -- Rochester (display, above) stays a
        // one-off hero moment, this is the everyday "quiet luxury" heading
        // font that actually scales across repeated headings.
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      fontSize: {
        "display-lg": ["4.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        "display-md": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
      },
      // De facto border-radius scale already in use sitewide -- documented
      // here rather than added as new tokens (new numeric keys would silently
      // reshape every admin/auth surface on Tailwind's default scale):
      //   rounded-md   (0.375rem) -- controls: buttons, inputs, small chips
      //   rounded-xl   (0.75rem)  -- secondary surfaces: dropdowns, tiles, filter panels
      //   rounded-2xl  (1rem)     -- primary cards: Card.jsx, listing images, modals
      //   rounded-full            -- circular, its own category: avatars, pills, icon chips
      boxShadow: {
        // Card surfaces rely on background/border contrast, not a drop
        // shadow, to read as elevated -- kept as a named token (rather than
        // stripping the `shadow-card` class from every usage) so there's one
        // place to change if that ever needs to come back.
        card: "none",
        glow: "0 0 15px 0 rgba(58,183,227,0.4)",
        // Soft, diffuse "quiet luxury" elevation for new hover/lift moments --
        // tinted with surface.900 (a warm neutral) rather than pure black, so
        // it reads softer/more considered than a hard-edged drop shadow.
        // Light-mode only by convention: pair with dark:shadow-none at the
        // call site, same as the existing .richshadow dark-mode override.
        "elevation-sm": "0 1px 2px 0 rgba(24,24,27,0.04), 0 4px 12px -4px rgba(24,24,27,0.06)",
        "elevation-md": "0 2px 4px 0 rgba(24,24,27,0.05), 0 12px 24px -8px rgba(24,24,27,0.10)",
        "elevation-lg": "0 4px 8px 0 rgba(24,24,27,0.06), 0 24px 48px -12px rgba(24,24,27,0.16)",
      },
      transitionTimingFunction: {
        // Smooth, decisive deceleration (not bouncy, not linear) for the new
        // hover/lift micro-interactions in this pass -- paired with duration-300.
        // Reserve 500ms+ (Framer Motion transition configs) for entrance/reveal
        // motion only, not hover states.
        luxury: "cubic-bezier(0.16, 1, 0.3, 1)",
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

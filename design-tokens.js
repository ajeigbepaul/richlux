// Single source of truth for color tokens, consumed by both tailwind.config.js
// (via require) and lib/muiTheme.js (via import) so the two styling systems
// never drift the way they used to (MUI ran on its stock default theme before).

const tokens = {
  // Public-site brand: sampled directly from the logo's actual pixels
  // (public/richlux.jpeg, public/logo.jpeg) -- dominant blue clustered at
  // rgb(48,180,252), not the earlier hand-picked #3ab7e3 approximation.
  brand: {
    50: "#eef9ff",
    100: "#d6f0ff",
    200: "#ade0ff",
    300: "#78ccff",
    400: "#30b4fc",
    500: "#1c98e0",
    600: "#0f7cbe",
    700: "#0f629a",
    800: "#124f7d",
    900: "#123f63",
  },
  // Light-mode neutrals for the public site -- true grey, also sampled from
  // the logo's wordmark (dominant cluster at rgb(72,72,72)-rgb(84,84,84));
  // no brown was actually present in the asset, so the theme is blue/grey/
  // white as sampled, not a guess between the two.
  ink: {
    900: "#3a3a3a",
    700: "#545454",
    // Darkened from the originally-sampled #7a7a7a (4.29:1 against white --
    // just under WCAG AA's 4.5:1 for normal text, and this token is used
    // everywhere as caption/secondary text). #707070 clears it at ~4.94:1
    // while staying visually all but identical.
    500: "#707070",
    300: "#d4d4d4",
    200: "#e8e8e8",
    100: "#f5f5f5",
    0: "#ffffff",
  },
  // Dark neutrals reserved for the admin back-office (and dark mode on the
  // public site). A true neutral charcoal rather than the earlier blue-slate
  // scale -- reads as subtler/classier and lets the brand blue stand out
  // instead of competing with a blue-tinted background.
  surface: {
    950: "#09090b",
    900: "#18181b",
    800: "#27272a",
    700: "#3f3f46",
    600: "#52525b",
  },
  // Legacy accent, kept as a named token so it's phased out deliberately
  // rather than mixed ad hoc with the new brand blue.
  accent: {
    300: "#f5b85c",
    400: "#e49a38",
    500: "#d9822a",
  },
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

module.exports = tokens;

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
    500: "#7a7a7a",
    300: "#d4d4d4",
    200: "#e8e8e8",
    100: "#f5f5f5",
    0: "#ffffff",
  },
  // Dark neutrals reserved for the admin back-office.
  surface: {
    950: "#0b1220",
    900: "#0f172a",
    800: "#1e293b",
    700: "#334155",
    600: "#475569",
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

// Single source of truth for color tokens, consumed by both tailwind.config.js
// (via require) and lib/muiTheme.js (via import) so the two styling systems
// never drift the way they used to (MUI ran on its stock default theme before).

const tokens = {
  // Public-site brand: light, cyan-blue, matches the Richlux Property flyers.
  brand: {
    50: "#eaf9fd",
    100: "#cdf0fa",
    200: "#9ce1f5",
    300: "#66cded",
    400: "#3ab7e3",
    500: "#1fa0cf",
    600: "#137fac",
    700: "#12648a",
    800: "#144f6f",
    900: "#14425c",
  },
  // Light-mode neutrals for the public site.
  ink: {
    900: "#0a0a0a",
    700: "#2b2b2b",
    500: "#6b6b6b",
    300: "#e5e5e5",
    200: "#eef1f3",
    100: "#f7f9fa",
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
